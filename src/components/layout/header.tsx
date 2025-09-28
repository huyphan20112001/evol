import { Button } from '@/components/ui/button'
import { PATHNAME } from '@/constants/common'
import { useAuthOperations, useAuthStatus } from '@/hooks/use-auth'
import { FileText, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStatus()
  const { logout } = useAuthOperations()

  const handleLogout = async () => {
    try {
      await logout()
      navigate(PATHNAME.HOME)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(PATHNAME.HOME)}
            className="text-xl font-bold hover:text-primary transition-colors"
          >
            Hybrid Mobile App
          </button>
        </div>

        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(PATHNAME.POSTS)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Posts
              </Button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.name || user?.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(PATHNAME.LOGIN)}
              >
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate(PATHNAME.SIGNUP)}>
                Sign Up
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
