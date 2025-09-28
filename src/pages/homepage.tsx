import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PATHNAME } from '@/constants/common'
import { useNavigate } from 'react-router-dom'

const Homepage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Hybrid Mobile App</h1>
          <p className="text-xl text-muted-foreground">
            Discover and share amazing posts with our community
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Get Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Join our community to explore posts, share your thoughts, and
              connect with others.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(PATHNAME.LOGIN)}
                className="flex-1 sm:flex-none"
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(PATHNAME.SIGNUP)}
                className="flex-1 sm:flex-none"
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Experience our app on web, Android, and iOS
          </p>
        </div>
      </div>
    </div>
  )
}

export default Homepage
