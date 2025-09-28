import { SignupForm } from '@/components/auth/signup-form'
import { Button } from '@/components/ui/button'
import { PATHNAME } from '@/constants/common'
import { useNavigate } from 'react-router-dom'

export function SignupPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">
            Sign up to start exploring posts
          </p>
        </div>

        <SignupForm />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button
              onClick={() => navigate(PATHNAME.LOGIN)}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
