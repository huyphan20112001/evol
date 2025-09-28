import GeolocationButton from '@/components/geo-location'
import { SearchablePosts } from '@/components/posts/searchable-posts'
import { Button } from '@/components/ui/button'
import { PATHNAME } from '@/constants/common'
import { useAuthOperations } from '@/hooks/use-auth'
import { parseSearchQueryString } from '@/utils/search'
import { LogOut } from 'lucide-react'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function PostsPage() {
  const location = useLocation()
  const { logout } = useAuthOperations()
  const navigate = useNavigate()

  const initialFilters = useMemo(() => {
    return parseSearchQueryString(location.search.slice(1))
  }, [location.search])

  const handleLogout = async () => {
    try {
      await logout()
      navigate(PATHNAME.HOME)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Discover and search posts from our community
          </p>
        </div>

        <section>
          <h2>Mobile features</h2>
          <GeolocationButton />
        </section>

        <SearchablePosts initialFilters={initialFilters} />
      </div>
    </div>
  )
}
