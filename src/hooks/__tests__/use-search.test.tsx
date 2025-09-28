import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Post, SearchFilters } from '@/types'
import {
  useSearchState,
  useSearchPosts,
  useSearchParams,
  useSearch,
  useSearchSuggestions,
} from '../use-search'
import * as postsApi from '@/lib/posts-api'

// Mock the posts API
vi.mock('@/lib/posts-api')
const mockGetPosts = vi.mocked(postsApi.getPosts)

// Mock posts data
const mockPosts: Post[] = [
  {
    id: 1,
    title: 'React Testing Guide',
    body: 'Learn how to test React components effectively',
    userId: 1,
    commentsCount: 5,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'TypeScript Best Practices',
    body: 'Improve your TypeScript code quality',
    userId: 2,
    commentsCount: 12,
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 3,
    title: 'JavaScript Fundamentals',
    body: 'Master the basics of JavaScript programming',
    userId: 1,
    commentsCount: 8,
    createdAt: '2024-01-25T09:15:00Z',
  },
]

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Mock window.location and history
const mockLocation = {
  pathname: '/posts',
  search: '',
}

const mockHistory = {
  replaceState: vi.fn(),
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

Object.defineProperty(window, 'history', {
  value: mockHistory,
  writable: true,
})

describe('Search Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.search = ''
    mockGetPosts.mockResolvedValue({
      posts: mockPosts,
      total: mockPosts.length,
      page: 1,
      limit: 1000,
    })
  })

  describe('useSearchState', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useSearchState())
      
      expect(result.current.filters).toEqual({ query: '' })
      expect(result.current.debouncedQuery).toBe('')
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('should initialize with provided filters', () => {
      const initialFilters: SearchFilters = {
        query: 'test',
        userId: 123,
      }
      const { result } = renderHook(() => useSearchState(initialFilters))
      
      expect(result.current.filters).toEqual(initialFilters)
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should update filters', () => {
      const { result } = renderHook(() => useSearchState())
      
      act(() => {
        result.current.updateFilters({ query: 'new query' })
      })
      
      expect(result.current.filters.query).toBe('new query')
    })

    it('should reset filters', () => {
      const initialFilters: SearchFilters = {
        query: 'test',
        userId: 123,
      }
      const { result } = renderHook(() => useSearchState(initialFilters))
      
      act(() => {
        result.current.resetFilters()
      })
      
      expect(result.current.filters).toEqual({ query: '' })
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('should debounce query updates', async () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useSearchState())
      
      act(() => {
        result.current.updateFilters({ query: 'test' })
      })
      
      expect(result.current.debouncedQuery).toBe('')
      
      act(() => {
        vi.advanceTimersByTime(300)
      })
      
      expect(result.current.debouncedQuery).toBe('test')
      
      vi.useRealTimers()
    })

    it('should generate query string', () => {
      const { result } = renderHook(() => useSearchState())
      
      act(() => {
        result.current.updateFilters({
          query: 'test',
          userId: 123,
        })
      })
      
      expect(result.current.queryString).toContain('q=test')
      expect(result.current.queryString).toContain('userId=123')
    })
  })

  describe('useSearchPosts', () => {
    const wrapper = createWrapper()

    it('should initialize with loading state', () => {
      const filters: SearchFilters = { query: 'React' }
      const { result } = renderHook(() => useSearchPosts(filters), { wrapper })
      
      expect(result.current.isLoading).toBe(true)
      expect(result.current.posts).toHaveLength(0)
    })

    it('should handle empty query', () => {
      const filters: SearchFilters = { query: '' }
      const { result } = renderHook(() => useSearchPosts(filters), { wrapper })
      
      // With empty query, all posts should be returned (no filtering)
      expect(result.current.posts).toHaveLength(3)
      expect(result.current.total).toBe(3)
    })
  })

  describe('useSearchParams', () => {
    beforeEach(() => {
      mockHistory.replaceState.mockClear()
    })

    it('should initialize with empty params', () => {
      const { result } = renderHook(() => useSearchParams())
      
      expect(result.current.searchParams.toString()).toBe('')
    })

    it('should update search params', () => {
      const { result } = renderHook(() => useSearchParams())
      const filters: SearchFilters = {
        query: 'test',
        userId: 123,
      }
      
      act(() => {
        result.current.updateSearchParams(filters)
      })
      
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        {},
        '',
        '/posts?q=test&userId=123'
      )
    })

    it('should clear search params', () => {
      const { result } = renderHook(() => useSearchParams())
      
      act(() => {
        result.current.clearSearchParams()
      })
      
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        {},
        '',
        '/posts'
      )
    })

    it('should parse filters from params', () => {
      mockLocation.search = '?q=test&userId=123'
      const { result } = renderHook(() => useSearchParams())
      
      const filters = result.current.getFiltersFromParams()
      expect(filters.filters.query).toBe('test')
      expect(filters.filters.userId).toBe(123)
    })
  })

  describe('useSearch', () => {
    const wrapper = createWrapper()

    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSearch(), { wrapper })
      
      expect(result.current.filters).toEqual({ query: '' })
      expect(result.current.hasActiveFilters).toBe(false)
      expect(result.current.isLoading).toBe(true)
    })

    it('should initialize from URL params', () => {
      mockLocation.search = '?q=initial&userId=456'
      const { result } = renderHook(() => useSearch(), { wrapper })
      
      expect(result.current.filters.query).toBe('initial')
      expect(result.current.filters.userId).toBe(456)
    })

    it('should update filters', () => {
      const { result } = renderHook(() => useSearch(), { wrapper })
      
      act(() => {
        result.current.updateFilters({ query: 'test' })
      })
      
      expect(result.current.filters.query).toBe('test')
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should clear search', () => {
      const { result } = renderHook(() => useSearch({ query: 'test' }), { wrapper })
      
      act(() => {
        result.current.clearSearch()
      })
      
      expect(result.current.filters).toEqual({ query: '' })
      expect(result.current.hasActiveFilters).toBe(false)
    })
  })

  describe('useSearchSuggestions', () => {
    it('should return suggestions based on query', () => {
      const { result } = renderHook(() => 
        useSearchSuggestions('React', mockPosts)
      )
      
      expect(result.current.suggestions).toHaveLength(1)
      expect(result.current.suggestions[0]).toEqual({
        type: 'title',
        text: 'React Testing Guide',
        postId: 1,
      })
      expect(result.current.hasSuggestions).toBe(true)
    })

    it('should return empty suggestions for short queries', () => {
      const { result } = renderHook(() => 
        useSearchSuggestions('R', mockPosts)
      )
      
      expect(result.current.suggestions).toHaveLength(0)
      expect(result.current.hasSuggestions).toBe(false)
    })

    it('should return empty suggestions for empty query', () => {
      const { result } = renderHook(() => 
        useSearchSuggestions('', mockPosts)
      )
      
      expect(result.current.suggestions).toHaveLength(0)
      expect(result.current.hasSuggestions).toBe(false)
    })

    it('should limit suggestions to 5 items', () => {
      const manyPosts = Array.from({ length: 10 }, (_, i) => ({
        ...mockPosts[0],
        id: i + 1,
        title: `React Post ${i + 1}`,
      }))
      
      const { result } = renderHook(() => 
        useSearchSuggestions('React', manyPosts)
      )
      
      expect(result.current.suggestions).toHaveLength(5)
    })

    it('should be case insensitive', () => {
      const { result } = renderHook(() => 
        useSearchSuggestions('react', mockPosts)
      )
      
      expect(result.current.suggestions).toHaveLength(1)
      expect(result.current.hasSuggestions).toBe(true)
    })
  })
})