import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Post, SearchFilters } from '@/types'
import * as postsApi from '@/lib/posts-api'
import { SearchablePosts } from '@/components/posts'

// Mock the posts API
vi.mock('@/lib/posts-api')
const mockGetPosts = vi.mocked(postsApi.getPosts)

// Mock the search components
vi.mock('@/components/search', () => ({
  SearchBar: ({ value, onSearch, onClear }: any) => (
    <div data-testid="search-bar">
      <input
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search posts..."
        data-testid="search-input"
      />
      <button onClick={onClear} data-testid="clear-button">Clear</button>
    </div>
  ),
  FilterPanel: ({ onFiltersChange, onClearFilters }: any) => (
    <div data-testid="filter-panel">
      <button data-testid="toggle-filters">Filters</button>
      <button onClick={onClearFilters} data-testid="clear-filters">Clear All</button>
      <input
        type="number"
        placeholder="User ID"
        onChange={(e) => onFiltersChange({ userId: parseInt(e.target.value) || undefined })}
        data-testid="user-id-input"
      />
    </div>
  ),
  SearchResults: ({ posts, total, isLoading, error, hasActiveFilters, onClearFilters }: any) => (
    <div data-testid="search-results">
      {isLoading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">Error: {error.message}</div>}
      {!isLoading && !error && (
        <div>
          <div data-testid="results-count">{total} results</div>
          {hasActiveFilters && (
            <button onClick={onClearFilters} data-testid="clear-results-filters">
              Clear Filters
            </button>
          )}
          <div data-testid="posts-list">
            {posts.map((post: Post) => (
              <div key={post.id} data-testid={`post-${post.id}`}>
                {post.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ),
}))

// Mock posts data
const mockPosts: Post[] = [
  {
    id: 1,
    title: 'React Testing Guide',
    body: 'Learn how to test React components effectively',
    userId: 1,
    commentsCount: 5,
  },
  {
    id: 2,
    title: 'TypeScript Best Practices',
    body: 'Improve your TypeScript code quality',
    userId: 2,
    commentsCount: 12,
  },
  {
    id: 3,
    title: 'JavaScript Fundamentals',
    body: 'Master the basics of JavaScript programming',
    userId: 1,
    commentsCount: 8,
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

describe('SearchablePosts', () => {
  const wrapper = createWrapper()

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

  it('should render search components', async () => {
    render(<SearchablePosts />, { wrapper })
    
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
    expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
    expect(screen.getByTestId('search-results')).toBeInTheDocument()
  })

  it('should initialize with provided filters', async () => {
    const initialFilters: SearchFilters = {
      query: 'React',
      userId: 1,
    }

    render(<SearchablePosts initialFilters={initialFilters} />, { wrapper })
    
    const searchInput = screen.getByTestId('search-input')
    expect(searchInput).toHaveValue('React')
  })

  it('should handle search input changes', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    const searchInput = screen.getByTestId('search-input')
    await user.type(searchInput, 'TypeScript')
    
    expect(searchInput).toHaveValue('TypeScript')
  })

  it('should toggle filter panel', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Initially collapsed
    expect(screen.getByTestId('toggle-filters')).toBeInTheDocument()
    
    // Click to expand
    await user.click(screen.getByTestId('toggle-filters'))
    
    // Should show expanded state (at least one close button)
    expect(screen.getAllByTestId('close-filters')).toHaveLength(1)
  })

  it('should handle filter changes', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Expand filters
    await user.click(screen.getByTestId('toggle-filters'))
    
    // Change user ID filter (get the first one)
    const userIdInputs = screen.getAllByTestId('user-id-input')
    await user.type(userIdInputs[0], '123')
    
    // The filter should be applied
    expect(userIdInputs[0]).toHaveValue(123)
  })

  it('should clear search when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Type in search
    const searchInput = screen.getByTestId('search-input')
    await user.type(searchInput, 'test')
    expect(searchInput).toHaveValue('test')
    
    // Clear search
    await user.click(screen.getByTestId('clear-button'))
    expect(searchInput).toHaveValue('')
  })

  it('should clear all filters when clear all is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Add some search text
    const searchInput = screen.getByTestId('search-input')
    await user.type(searchInput, 'test')
    
    // Expand filters and add filter
    await user.click(screen.getByTestId('toggle-filters'))
    const userIdInputs = screen.getAllByTestId('user-id-input')
    await user.type(userIdInputs[0], '123')
    
    // Clear all filters
    const clearButtons = screen.getAllByTestId('clear-filters')
    await user.click(clearButtons[0])
    
    expect(searchInput).toHaveValue('')
  })

  it('should display loading state', async () => {
    // Mock loading state
    mockGetPosts.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<SearchablePosts />, { wrapper })
    
    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should display error state', async () => {
    mockGetPosts.mockRejectedValue(new Error('API Error'))
    
    render(<SearchablePosts />, { wrapper })
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Error: API Error')).toBeInTheDocument()
  })

  it('should display search results', async () => {
    render(<SearchablePosts />, { wrapper })
    
    await waitFor(() => {
      expect(screen.getByTestId('results-count')).toBeInTheDocument()
    })
    
    expect(screen.getByText('3 results')).toBeInTheDocument()
    expect(screen.getByTestId('post-1')).toBeInTheDocument()
    expect(screen.getByTestId('post-2')).toBeInTheDocument()
    expect(screen.getByTestId('post-3')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <SearchablePosts className="custom-class" />, 
      { wrapper }
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should handle responsive filter panel', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Toggle filters to show
    await user.click(screen.getByTestId('toggle-filters'))
    
    // Should show expanded filter panel (at least one close button)
    expect(screen.getAllByTestId('close-filters')).toHaveLength(1)
  })
})