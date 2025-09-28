import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthOperations } from '@/hooks/use-auth'
import { handleError } from '@/utils/error'

type LogoutButtonProps = {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  children?: React.ReactNode
  className?: string
  onLogoutStart?: () => void
  onLogoutComplete?: () => void
}

export const LogoutButton = ({
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  children,
  className,
  onLogoutStart,
  onLogoutComplete,
}: LogoutButtonProps) => {
  const { logout, isLoading } = useAuthOperations()

  const handleLogout = async () => {
    try {
      onLogoutStart?.()
      await logout()
      onLogoutComplete?.()
    } catch (error) {
      handleError(error)
      onLogoutComplete?.()
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        showIcon && <LogOut className="h-4 w-4" />
      )}
      {children || (size !== 'icon' && 'Sign Out')}
    </Button>
  )
}
