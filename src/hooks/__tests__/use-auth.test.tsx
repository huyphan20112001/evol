import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/components/auth-context'
import { useAuthOperations, useAuthStatus, useCurrentUser } from '../use-auth'
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
)

describe('useAuthOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(authApi.tokenUtils.getToken as any).mockReturnValue(null)
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(false)
  })

  it('should provide auth operations', () => {
    const { result } = renderHook(() => useAuthOperations(), { wrapper })

    expect(result.current).toHaveProperty('isAuthenticated')
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('login')
    expect(result.current).toHaveProperty('signup')
    expect(result.current).toHaveProperty('logout')
    expect(result.current).toHaveProperty('clearError')
    expect(result.current).toHaveProperty('hasRole')
    expect(result.current).toHaveProperty('getUserDisplayName')
    expect(result.current).toHaveProperty('isOwner')
  })

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useAuthOperations(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should return correct display name for guest user', () => {
    const { result } = renderHook(() => useAuthOperations(), { wrapper })

    expect(result.current.getUserDisplayName()).toBe('Guest')
  })

  it('should return correct display name for authenticated user', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    const { result } = renderHook(() => useAuthOperations(), { wrapper })

    expect(result.current.getUserDisplayName()).toBe('John Doe')
  })

  it('should return username as display name when name is not available', () => {
    const mockUser = {
      id: 1,
      username: 'johndoe',
      email: 'john@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    const { result } = renderHook(() => useAuthOperations(), { wrapper })

    expect(result.current.getUserDisplayName()).toBe('johndoe')
  })

  it('should check ownership correctly', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    const { result } = renderHook(() => useAuthOperations(), { wrapper })

    expect(result.current.isOwner(1)).toBe(true)
    expect(result.current.isOwner(2)).toBe(false)
  })

  it('should return false for hasRole when not authenticated', () => {
    const { result } = renderHook(() => useAuthOperations(), { wrapper })

    expect(result.current.hasRole()).toBe(false)
  })

  it('should return true for hasRole when authenticated', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    const { result } = renderHook(() => useAuthOperations(), { wrapper })

    expect(result.current.hasRole()).toBe(true)
  })
})

describe('useAuthStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(authApi.tokenUtils.getToken as any).mockReturnValue(null)
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(false)
  })

  it('should provide auth status', () => {
    const { result } = renderHook(() => useAuthStatus(), { wrapper })

    expect(result.current).toHaveProperty('isAuthenticated')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('isGuest')
  })

  it('should return correct status for unauthenticated user', () => {
    const { result } = renderHook(() => useAuthStatus(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isGuest).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it('should return correct status for authenticated user', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    const { result } = renderHook(() => useAuthStatus(), { wrapper })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isGuest).toBe(false)
    expect(result.current.user).toEqual(mockUser)
  })
})

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(authApi.tokenUtils.getToken as any).mockReturnValue(null)
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(false)
  })

  it('should provide current user information', () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('isAuthenticated')
    expect(result.current).toHaveProperty('userId')
    expect(result.current).toHaveProperty('username')
    expect(result.current).toHaveProperty('email')
    expect(result.current).toHaveProperty('displayName')
  })

  it('should return correct information for unauthenticated user', () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.userId).toBeUndefined()
    expect(result.current.username).toBeUndefined()
    expect(result.current.email).toBeUndefined()
    expect(result.current.displayName).toBe('User')
  })

  it('should return correct information for authenticated user', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.userId).toBe(1)
    expect(result.current.username).toBe('johndoe')
    expect(result.current.email).toBe('john@example.com')
    expect(result.current.displayName).toBe('John Doe')
  })

  it('should use username as display name when name is not available', () => {
    const mockUser = {
      id: 1,
      username: 'johndoe',
      email: 'john@example.com',
    }

    ;(authApi.tokenUtils.getToken as any).mockReturnValue('valid-token')
    ;(authApi.tokenUtils.isTokenValid as any).mockReturnValue(true)
    ;(authApi.tokenUtils.getUserIdFromToken as any).mockReturnValue(1)
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'auth_user') return JSON.stringify(mockUser)
      return null
    })

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    expect(result.current.displayName).toBe('johndoe')
  })
})
