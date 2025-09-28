import { useState, useCallback, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Post, SearchFilters } from '@/types'
import {
  applySearchFilters,
  debounce,
  createSearchQueryString,
  parseSearchQueryString,
} from '@/utils/search'
import { getPosts } from '@/lib/posts-api'

export const SEARCH_QUERY_KEYS = {
  all: ['search'] as const,
  filtered: (filters: SearchFilters) =>
    [...SEARCH_QUERY_KEYS.all, 'filtered', filters] as const,
}

export const useSearchState = (
  initialFilters: SearchFilters = { query: '' },
  initialPage = 1,
) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query)
  const [page, setPage] = useState<number>(initialPage)

  const debouncedSetQuery = useCallback(
    debounce((query: string) => {
      setDebouncedQuery(query)
    }, 300),
    [],
  )

  useEffect(() => {
    debouncedSetQuery(filters.query)
  }, [filters.query, debouncedSetQuery])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(1)
  }, [])

  const updatePage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ query: '' })
    setDebouncedQuery('')
    setPage(1)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.query ||
      filters.dateRange ||
      filters.commentCountRange ||
      filters.userId
    )
  }, [filters])

  return {
    filters,
    debouncedQuery,
    page,
    updatePage,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    queryString: createSearchQueryString(filters),
  }
}

export const useSearchPosts = (filters: SearchFilters) => {
  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      query: filters.query,
    }),
    [filters],
  )

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useQuery({
    queryKey: ['posts', 'all'],
    queryFn: () => getPosts({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const filteredPosts = useMemo(() => {
    if (!postsData?.posts) return []
    return applySearchFilters(postsData.posts, effectiveFilters)
  }, [postsData?.posts, effectiveFilters])

  const searchResults = useMemo(
    () => ({
      posts: filteredPosts,
      total: filteredPosts.length,
      hasResults: filteredPosts.length > 0,
      isEmpty: filteredPosts.length === 0 && !isLoadingPosts,
    }),
    [filteredPosts, isLoadingPosts],
  )

  return {
    ...searchResults,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: () => {},
  }
}

export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search)
    }
    return new URLSearchParams()
  })

  const updateSearchParams = useCallback(
    (filters: SearchFilters, page?: number) => {
      const queryString = createSearchQueryString(filters)
      const newParams = new URLSearchParams(queryString)

      if (page && page > 1) {
        newParams.set('page', String(page))
      }

      setSearchParams(newParams)

      if (typeof window !== 'undefined') {
        const qs = newParams.toString()
        const newUrl = qs
          ? `${window.location.pathname}?${qs}`
          : window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    },
    [],
  )

  const getFiltersFromParams = useCallback(() => {
    const filters = parseSearchQueryString(searchParams.toString())
    const pageParam = searchParams.get('page')
    const page = pageParam ? Math.max(1, Number(pageParam) || 1) : 1
    return { filters, page }
  }, [searchParams])

  const clearSearchParams = useCallback(() => {
    setSearchParams(new URLSearchParams())

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  return {
    searchParams,
    updateSearchParams,
    getFiltersFromParams,
    clearSearchParams,
  }
}

export const useSearch = (initialFilters?: SearchFilters) => {
  const { updateSearchParams, getFiltersFromParams, clearSearchParams } =
    useSearchParams()

  const urlState = useMemo(() => getFiltersFromParams(), [getFiltersFromParams])
  const startingFilters = initialFilters || urlState.filters || { query: '' }
  const startingPage = urlState.page || 1

  const searchState = useSearchState(startingFilters, startingPage)
  const searchResults = useSearchPosts({
    ...searchState.filters,
    query: searchState.debouncedQuery,
  })

  useEffect(() => {
    updateSearchParams(searchState.filters, searchState.page)
  }, [searchState.filters, searchState.page, updateSearchParams])

  const clearSearch = useCallback(() => {
    searchState.resetFilters()
    clearSearchParams()
  }, [searchState.resetFilters, clearSearchParams])

  return {
    filters: searchState.filters,
    updateFilters: searchState.updateFilters,
    page: searchState.page,
    updatePage: searchState.updatePage,
    hasActiveFilters: searchState.hasActiveFilters,
    clearSearch,

    posts: searchResults.posts,
    total: searchResults.total,
    hasResults: searchResults.hasResults,
    isEmpty: searchResults.isEmpty,
    isLoading: searchResults.isLoading,
    error: searchResults.error,
  }
}

export const useSearchSuggestions = (query: string, posts: Post[]) => {
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return []

    const searchTerm = query.toLowerCase()
    const titleSuggestions = posts
      .filter((post) => post.title.toLowerCase().includes(searchTerm))
      .slice(0, 5)
      .map((post) => ({
        type: 'title' as const,
        text: post.title,
        postId: post.id,
      }))

    return titleSuggestions
  }, [query, posts])

  return {
    suggestions,
    hasSuggestions: suggestions.length > 0,
  }
}
