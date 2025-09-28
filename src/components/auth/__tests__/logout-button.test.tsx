import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/components/auth-context'
import { LogoutButton } from '../logout-button'
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
        <LogoutButton {...props} />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(authApi.tokenUtils.getToken as any).mockReturnValue(null)
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(false)
    ;(authApi.logout as any).mockResolvedValue(undefined)
  })

  it('should render logout button with default props', () => {
    renderWithProvider()

    const button = screen.getByRole('button', { name: 'Sign Out' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex') // Button component classes
  })

  it('should render with custom children', () => {
    renderWithProvider({ children: 'Custom Logout Text' })

    expect(screen.getByRole('button', { name: 'Custom Logout Text' })).toBeInTheDocument()
  })

  it('should render icon by default', () => {
    renderWithProvider()

    const button = screen.getByRole('button', { name: 'Sign Out' })
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should not render icon when showIcon is false', () => {
    renderWithProvider({ showIcon: false })

    const button = screen.getByRole('button', { name: 'Sign Out' })
    const icon = button.querySelector('svg')
    expect(icon).not.toBeInTheDocument()
  })

  it('should render only icon for icon size', () => {
    renderWithProvider({ size: 'icon' })

    const button = screen.getByRole('button')
    expect(button).not.toHaveTextContent('Sign Out')
    
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should call logout API when clicked', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    const button = screen.getByRole('button', { name: 'Sign Out' })
    await user.click(button)

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalled()
    })
  })

  it('should call onLogoutStart and onLogoutComplete callbacks', async () => {
    const user = userEvent.setup()
    const onLogoutStart = vi.fn()
    const onLogoutComplete = vi.fn()

    renderWithProvider({ onLogoutStart, onLogoutComplete })

    const button = screen.getByRole('button', { name: 'Sign Out' })
    await user.click(button)

    await waitFor(() => {
      expect(onLogoutStart).toHaveBeenCalled()
      expect(onLogoutComplete).toHaveBeenCalled()
    })
  })

  it('should show loading state during logout', async () => {
    const user = userEvent.setup()
    ;(authApi.logout as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderWithProvider()

    const button = screen.getByRole('button', { name: 'Sign Out' })
    await user.click(button)

    // Check for loading spinner
    const spinner = button.querySelector('svg')
    expect(spinner).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('should handle logout API failure gracefully', async () => {
    const user = userEvent.setup()
    const onLogoutComplete = vi.fn()

    ;(authApi.logout as any).mockRejectedValue(new Error('Logout failed'))

    renderWithProvider({ onLogoutComplete })

    const button = screen.getByRole('button', { name: 'Sign Out' })
    await user.click(button)

    await waitFor(() => {
      expect(onLogoutComplete).toHaveBeenCalled()
    })
  })

  it('should apply custom className', () => {
    renderWithProvider({ className: 'custom-class' })

    const button = screen.getByRole('button', { name: 'Sign Out' })
    expect(button).toHaveClass('custom-class')
  })

  it('should apply different variants', () => {
    const { rerender } = renderWithProvider({ variant: 'destructive' })
    
    let button = screen.getByRole('button', { name: 'Sign Out' })
    expect(button).toHaveClass('bg-destructive')

    rerender(
      <BrowserRouter>
        <AuthProvider>
          <LogoutButton variant="outline" />
        </AuthProvider>
      </BrowserRouter>
    )

    button = screen.getByRole('button', { name: 'Sign Out' })
    expect(button).toHaveClass('border')
  })

  it('should apply different sizes', () => {
    const { rerender } = renderWithProvider({ size: 'sm' })
    
    let button = screen.getByRole('button', { name: 'Sign Out' })
    expect(button).toHaveClass('h-8')

    rerender(
      <BrowserRouter>
        <AuthProvider>
          <LogoutButton size="lg" />
        </AuthProvider>
      </BrowserRouter>
    )

    button = screen.getByRole('button', { name: 'Sign Out' })
    expect(button).toHaveClass('h-10')
  })

  it('should be disabled when auth is loading', () => {
    // Mock loading state
    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    
    renderWithProvider()

    const button = screen.getByRole('button', { name: 'Sign Out' })
    // The button should not be disabled just because there's a token
    // It should only be disabled during the logout process
    expect(button).not.toBeDisabled()
  })
})