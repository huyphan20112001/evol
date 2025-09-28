import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStatus } from '@/hooks/use-auth'
import { PATHNAME } from '@/constants/common'

type AuthGuardProps = {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export const AuthGuard = ({
  children,
  requireAuth = true,
  redirectTo,
  fallback,
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuthStatus()
  console.log("🚀 ~ AuthGuard ~ isAuthenticated => ", isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isLoading) return

    if (requireAuth && !isAuthenticated) {
      const redirectPath = redirectTo || PATHNAME.LOGIN
      navigate(redirectPath, {
        replace: true,
        state: { from: location.pathname },
      })
    } else if (!requireAuth && isAuthenticated) {
      const redirectPath = redirectTo || PATHNAME.HOME
      navigate(redirectPath, { replace: true })
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    redirectTo,
    navigate,
    location.pathname,
  ])

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )
    )
  }

  const hasAccess = requireAuth ? isAuthenticated : !isAuthenticated

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}

export const ProtectedRoute = ({
  children,
  ...props
}: Omit<AuthGuardProps, 'requireAuth'>) => {
  return (
    <AuthGuard requireAuth={true} {...props}>
      {children}
    </AuthGuard>
  )
}

export const PublicRoute = ({
  children,
  ...props
}: Omit<AuthGuardProps, 'requireAuth'>) => {
  return (
    <AuthGuard requireAuth={false} {...props}>
      {children}
    </AuthGuard>
  )
}

type ConditionalRouteProps = {
  authenticatedContent: React.ReactNode
  unauthenticatedContent: React.ReactNode
  fallback?: React.ReactNode
}

export const ConditionalRoute = ({
  authenticatedContent,
  unauthenticatedContent,
  fallback,
}: ConditionalRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStatus()

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )
    )
  }

  return <>{isAuthenticated ? authenticatedContent : unauthenticatedContent}</>
}
