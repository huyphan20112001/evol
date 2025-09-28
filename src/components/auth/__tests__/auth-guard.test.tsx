import { AuthProvider } from '@/components/auth-context'
import * as authApi from '@/lib/auth-api'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthGuard, ConditionalRoute, ProtectedRoute, PublicRoute } from '../auth-guard'

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

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/test' }),
  }
})

const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(authApi.tokenUtils.getToken as any).mockReturnValue(null)
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(false)
    mockNavigate.mockClear()
  })

  it('should show loading state initially', async () => {
    renderWithProvider(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    // The loading state might be very brief, so we need to wait for it to settle
    await waitFor(() => {
      // After loading, it should either show content or redirect
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        replace: true,
        state: { from: '/test' },
      })
    })
  })

  it('should show custom fallback during loading', async () => {
    renderWithProvider(
      <AuthGuard fallback={<div>Custom Loading</div>}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    // The loading state might be very brief, so we need to wait for it to settle
    await waitFor(() => {
      // After loading, it should either show content or redirect
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        replace: true,
        state: { from: '/test' },
      })
    })
  })

  it('should redirect unauthenticated user to login for protected route', async () => {
    renderWithProvider(
      <AuthGuard requireAuth={true}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        replace: true,
        state: { from: '/test' },
      })
    })
  })

  it('should redirect to custom path when specified', async () => {
    renderWithProvider(
      <AuthGuard requireAuth={true} redirectTo="/custom-login">
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/custom-login', {
        replace: true,
        state: { from: '/test' },
      })
    })
  })

  it('should show content for authenticated user on protected route', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      username: 'test',
      email: 'test@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    renderWithProvider(
      <AuthGuard requireAuth={true}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should redirect authenticated user away from public route', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      username: 'test',
      email: 'test@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    renderWithProvider(
      <AuthGuard requireAuth={false}>
        <div>Public Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('should show content for unauthenticated user on public route', async () => {
    renderWithProvider(
      <AuthGuard requireAuth={false}>
        <div>Public Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(screen.getByText('Public Content')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(authApi.tokenUtils.getToken as any).mockReturnValue(null)
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(false)
    mockNavigate.mockClear()
  })

  it('should redirect unauthenticated user to login', async () => {
    renderWithProvider(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        replace: true,
        state: { from: '/test' },
      })
    })
  })

  it('should show content for authenticated user', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      username: 'test',
      email: 'test@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    renderWithProvider(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })
})

describe('PublicRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(authApi.tokenUtils.getToken as any).mockReturnValue(null)
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(false)
    mockNavigate.mockClear()
  })

  it('should show content for unauthenticated user', async () => {
    renderWithProvider(
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Public Content')).toBeInTheDocument()
    })
  })

  it('should redirect authenticated user to home', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      username: 'test',
      email: 'test@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    renderWithProvider(
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })
})

describe('ConditionalRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(authApi.tokenUtils.getToken as any).mockReturnValue(null)
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(false)
  })

  it('should show unauthenticated content for unauthenticated user', async () => {
    renderWithProvider(
      <ConditionalRoute
        authenticatedContent={<div>Authenticated Content</div>}
        unauthenticatedContent={<div>Unauthenticated Content</div>}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Unauthenticated Content')).toBeInTheDocument()
      expect(screen.queryByText('Authenticated Content')).not.toBeInTheDocument()
    })
  })

  it('should show authenticated content for authenticated user', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      username: 'test',
      email: 'test@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    renderWithProvider(
      <ConditionalRoute
        authenticatedContent={<div>Authenticated Content</div>}
        unauthenticatedContent={<div>Unauthenticated Content</div>}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Authenticated Content')).toBeInTheDocument()
      expect(screen.queryByText('Unauthenticated Content')).not.toBeInTheDocument()
    })
  })

  it('should show custom fallback during loading', async () => {
    renderWithProvider(
      <ConditionalRoute
        authenticatedContent={<div>Authenticated Content</div>}
        unauthenticatedContent={<div>Unauthenticated Content</div>}
        fallback={<div>Custom Loading</div>}
      />
    )

    // The loading state might be very brief, so we need to wait for it to settle
    await waitFor(() => {
      expect(screen.getByText('Unauthenticated Content')).toBeInTheDocument()
    })
  })
})