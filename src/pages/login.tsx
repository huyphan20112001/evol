import { LoginForm } from '@/components/auth/login-form'
import GeolocationButton from '@/components/geo-location'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PATHNAME } from '@/constants/common'
import { QUICK_LOGIN_EXAMPLES } from '@/constants/demo-users'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <section>
          <h2>Mobile features</h2>
          <GeolocationButton />
        </section>

        <LoginForm onSuccess={() => navigate(PATHNAME.POSTS)} />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Use any of these usernames with any password (min 6 chars):
            </p>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {QUICK_LOGIN_EXAMPLES.map((example) => (
                <div
                  key={example.username}
                  className="font-mono bg-muted p-2 rounded"
                >
                  Username:{' '}
                  <span className="font-semibold">{example.username}</span>
                  <br />
                  Password:{' '}
                  <span className="font-semibold">{example.password}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => navigate(PATHNAME.SIGNUP)}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
