import { useCallback } from 'react'
import { useSearch } from '@/hooks/use-search'
import { SearchBar, FilterPanel, SearchResults } from '@/components/search'
import type { SearchFilters } from '@/types'

type SearchablePostsProps = {
  initialFilters?: SearchFilters
  className?: string
}

export function SearchablePosts({
  initialFilters,
  className = '',
}: SearchablePostsProps) {
  const {
    filters,
    updateFilters,
    hasActiveFilters,
    clearSearch,
    posts,
    total,
    isLoading,
    error,
    page,
    updatePage,
  } = useSearch(initialFilters)

  const handleSearchChange = useCallback(
    (query: string) => {
      updateFilters({ query })
    },
    [updateFilters],
  )

  const handleFiltersChange = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      updateFilters(newFilters)
    },
    [updateFilters],
  )

  const handleClearSearch = useCallback(() => {
    clearSearch()
  }, [clearSearch])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <SearchBar
            value={filters.query}
            onSearch={handleSearchChange}
            onClear={handleClearSearch}
            placeholder="Search posts by title or content..."
            className="w-full"
          />
        </div>

        {/* Filter Panel */}
        <div className="flex-shrink-0">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={clearSearch}
          />
        </div>
      </div>

      {/* Search Results */}
      <SearchResults
        posts={posts}
        total={total}
        isLoading={isLoading}
        error={error}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearSearch}
        currentPage={page}
        onPageChange={updatePage}
      />
    </div>
  )
}

export default SearchablePosts
