import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { globalRouter } from '../utils/global-router'
import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  tokenUtils,
} from '@/lib/auth-api'
import type { LoginCredentials, SignupData, AuthResponse } from '@/types/auth'
import type { User } from '@/types/user'
import { PATHNAME } from '@/constants/common'

type AuthContextType = {
  isAuthenticated: boolean
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (userData: SignupData) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    globalRouter.navigate = navigate
    globalRouter.logout = () => {
      logout()
    }
  }, [navigate])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = tokenUtils.getToken()
        if (token && tokenUtils.isTokenValid(token)) {
          const userId = tokenUtils.getUserIdFromToken(token)
          if (userId) {
            const storedUser = localStorage.getItem('auth_user')
            if (storedUser) {
              const userData = JSON.parse(storedUser)
              setUser(userData)
              setIsAuthenticated(true)
            }
          }
        } else {
          tokenUtils.removeToken()
          localStorage.removeItem('auth_user')
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        tokenUtils.removeToken()
        localStorage.removeItem('auth_user')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      setError(null)

      const authResponse: AuthResponse = await apiLogin(credentials)

      tokenUtils.setToken(authResponse.token)
      localStorage.setItem('auth_user', JSON.stringify(authResponse.user))

      setUser(authResponse.user)
      setIsAuthenticated(true)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (userData: SignupData) => {
    try {
      setIsLoading(true)
      setError(null)

      const authResponse: AuthResponse = await apiSignup(userData)

      tokenUtils.setToken(authResponse.token)
      localStorage.setItem('auth_user', JSON.stringify(authResponse.user))

      setUser(authResponse.user)
      setIsAuthenticated(true)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Signup failed'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)

      await apiLogout()
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      tokenUtils.removeToken()
      localStorage.removeItem('auth_user')
      setUser(null)
      setIsAuthenticated(false)
      setError(null)
      setIsLoading(false)

      navigate(PATHNAME.LOGIN, { replace: true })
    }
  }, [navigate])

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    isLoading,
    error,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
