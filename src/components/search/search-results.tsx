import { Search, AlertCircle } from 'lucide-react'
import { PostCard } from '@/components/posts/post-card'
import { PostSkeleton } from '@/components/posts/post-skeleton'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/posts/pagination'
import { useEffect, useMemo } from 'react'
import type { Post, SearchFilters } from '@/types'

type SearchResultsProps = {
  posts: Post[]
  total: number
  isLoading: boolean
  error: Error | null
  filters: SearchFilters
  hasActiveFilters: boolean
  onClearFilters: () => void
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
}

export const SearchResults = ({
  posts,
  total,
  isLoading,
  error,
  filters,
  hasActiveFilters,
  onClearFilters,
  currentPage,
  onPageChange,
  className = '',
}: SearchResultsProps) => {
  const ITEMS_PER_PAGE = 10

  const totalPages = Math.max(
    1,
    Math.ceil((posts?.length ?? 0) / ITEMS_PER_PAGE),
  )

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages)
    }
    if (currentPage < 1) {
      onPageChange(1)
    }
  }, [currentPage, totalPages, onPageChange])

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return posts.slice(start, end)
  }, [posts, currentPage])

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 ${className}`}
      >
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Search Error</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-md">
          There was an error searching for posts. Please try again.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Error: {error.message}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 ${className}`}
      >
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No posts found</h3>
        {hasActiveFilters ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4 max-w-md">
              No posts match your current search criteria. Try adjusting your
              filters or search terms.
            </p>
            <div className="space-y-2">
              {filters.query && (
                <p className="text-sm text-muted-foreground">
                  Search: "{filters.query}"
                </p>
              )}
              {filters.userId && (
                <p className="text-sm text-muted-foreground">
                  User ID: {filters.userId}
                </p>
              )}
              {filters.commentCountRange && (
                <p className="text-sm text-muted-foreground">
                  Comments: {filters.commentCountRange.min} -{' '}
                  {filters.commentCountRange.max}
                </p>
              )}
              {filters.dateRange && (
                <p className="text-sm text-muted-foreground">
                  Date: {filters.dateRange.start?.toLocaleDateString()} -{' '}
                  {filters.dateRange.end?.toLocaleDateString()}
                </p>
              )}
            </div>
            <Button onClick={onClearFilters} variant="outline" className="mt-4">
              Clear all filters
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground max-w-md text-center">
            Try searching for posts using the search bar above.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {hasActiveFilters ? 'Search Results' : 'All Posts'}
          </h2>
          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'post' : 'posts'} found
        </p>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-xs">
          {filters.query && (
            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
              Search: "{filters.query}"
            </span>
          )}
          {filters.userId && (
            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
              User: {filters.userId}
            </span>
          )}
          {filters.commentCountRange && (
            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
              Comments: {filters.commentCountRange.min}-
              {filters.commentCountRange.max}
            </span>
          )}
          {filters.dateRange && (
            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
              Date: {filters.dateRange.start?.toLocaleDateString()} -{' '}
              {filters.dateRange.end?.toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Posts grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination controls */}
      <div className="pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default SearchResults
