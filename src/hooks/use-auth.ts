import { useAuth } from '@/components/auth-context'
import { useCallback } from 'react'
import type { LoginCredentials, SignupData } from '@/types/auth'

export const useAuthOperations = () => {
  const {
    isAuthenticated,
    user,
    login: contextLogin,
    signup: contextSignup,
    logout: contextLogout,
    isLoading,
    error,
    clearError,
  } = useAuth()

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        await contextLogin(credentials)
      } catch (error) {
        throw error
      }
    },
    [contextLogin],
  )

  const signup = useCallback(
    async (userData: SignupData) => {
      try {
        await contextSignup(userData)
      } catch (error) {
        throw error
      }
    },
    [contextSignup],
  )

  const logout = useCallback(async () => {
    try {
      await contextLogout()
    } catch (error) {
      console.warn('Logout error:', error)
    }
  }, [contextLogout])

  const hasRole = useCallback((): boolean => {
    return isAuthenticated
  }, [isAuthenticated])

  const getUserDisplayName = useCallback((): string => {
    if (!user) return 'Guest'
    return user.name || user.username || 'User'
  }, [user])

  const isOwner = useCallback(
    (contentUserId: number): boolean => {
      return user?.id === contentUserId
    },
    [user],
  )

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
    hasRole,
    getUserDisplayName,
    isOwner,
  }
}

export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuth()

  return {
    isAuthenticated,
    isLoading,
    user,
    isGuest: !isAuthenticated,
  }
}

export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuth()

  return {
    user,
    isAuthenticated,
    userId: user?.id,
    username: user?.username,
    email: user?.email,
    displayName: user?.name || user?.username || 'User',
  }
}
