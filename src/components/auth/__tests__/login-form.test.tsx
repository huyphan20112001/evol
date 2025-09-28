import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/components/auth-context'
import { LoginForm } from '../login-form'
import * as authApi from '@/lib/auth-api'

// Mock the auth API
vi.mock('@/lib/auth-api', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  tokenUtils: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    removeToken: vi.fn(),
    isTokenValid: vi.fn(),
    getUserIdFromToken: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

const renderWithProvider = (props = {}) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginForm {...props} />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(authApi.tokenUtils.getToken as any).mockReturnValue(null)
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(false)
  })

  it('should render login form with all fields', () => {
    renderWithProvider()

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Username or Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('should show password toggle button', () => {
    renderWithProvider()

    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('should show validation error for short username', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    const usernameInput = screen.getByLabelText('Username or Email')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(usernameInput, 'ab')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument()
    })
  })

  it('should show validation error for short password', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    const usernameInput = screen.getByLabelText('Username or Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('should call login API with correct data on valid submission', async () => {
    const user = userEvent.setup()
    const mockAuthResponse = {
      token: 'test-token',
      user: { id: 1, name: 'Test User', username: 'testuser', email: 'test@example.com' },
      expiresIn: 3600,
    }

    ;(authApi.login as any).mockResolvedValue(mockAuthResponse)

    const onSuccess = vi.fn()
    renderWithProvider({ onSuccess })

    const usernameInput = screen.getByLabelText('Username or Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      })
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should show error message on login failure', async () => {
    const user = userEvent.setup()
    ;(authApi.login as any).mockRejectedValue(new Error('Invalid credentials'))

    renderWithProvider()

    const usernameInput = screen.getByLabelText('Username or Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    ;(authApi.login as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithProvider()

    const usernameInput = screen.getByLabelText('Username or Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should call onSwitchToSignup when signup link is clicked', async () => {
    const user = userEvent.setup()
    const onSwitchToSignup = vi.fn()

    renderWithProvider({ onSwitchToSignup })

    const signupLink = screen.getByText('Sign up')
    await user.click(signupLink)

    expect(onSwitchToSignup).toHaveBeenCalled()
  })

  it('should not show signup link when onSwitchToSignup is not provided', () => {
    renderWithProvider()

    expect(screen.queryByText('Sign up')).not.toBeInTheDocument()
  })

  it('should disable form fields during loading', async () => {
    const user = userEvent.setup()
    ;(authApi.login as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithProvider()

    const usernameInput = screen.getByLabelText('Username or Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(usernameInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})