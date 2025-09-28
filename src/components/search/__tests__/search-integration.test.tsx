import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { SearchablePosts } from '../searchable-posts'
import type { Post } from '@/types'
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
  {
    id: 4,
    title: 'Vue.js Introduction',
    body: 'Getting started with Vue.js framework',
    userId: 3,
    commentsCount: 3,
    createdAt: '2024-02-01T12:00:00Z',
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

describe('Search Integration', () => {
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

  it('should filter posts by search query', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('4 posts found')).toBeInTheDocument()
    })
    
    // Search for "React"
    const searchInput = screen.getByRole('textbox', { name: /search posts/i })
    await user.type(searchInput, 'React')
    
    // Should show only React post
    await waitFor(() => {
      expect(screen.getByText('1 post found')).toBeInTheDocument()
    })
    
    expect(screen.getByText('React Testing Guide')).toBeInTheDocument()
    expect(screen.queryByText('TypeScript Best Practices')).not.toBeInTheDocument()
  })

  it('should filter posts by user ID', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('4 posts found')).toBeInTheDocument()
    })
    
    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i })
    await user.click(filtersButton)
    
    // Set user ID filter
    const userIdInput = screen.getByLabelText('User ID')
    await user.type(userIdInput, '1')
    
    // Should show only posts from user 1
    await waitFor(() => {
      expect(screen.getByText('2 posts found')).toBeInTheDocument()
    })
    
    expect(screen.getByText('React Testing Guide')).toBeInTheDocument()
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument()
    expect(screen.queryByText('TypeScript Best Practices')).not.toBeInTheDocument()
  })

  it('should filter posts by comment count range', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('4 posts found')).toBeInTheDocument()
    })
    
    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i })
    await user.click(filtersButton)
    
    // Set comment count range
    const minCommentsInput = screen.getByLabelText('Min')
    const maxCommentsInput = screen.getByLabelText('Max')
    await user.type(minCommentsInput, '5')
    await user.type(maxCommentsInput, '10')
    
    // Should show posts with 5-10 comments
    await waitFor(() => {
      expect(screen.getByText('2 posts found')).toBeInTheDocument()
    })
    
    expect(screen.getByText('React Testing Guide')).toBeInTheDocument() // 5 comments
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument() // 8 comments
    expect(screen.queryByText('TypeScript Best Practices')).not.toBeInTheDocument() // 12 comments
  })

  it('should filter posts by date range', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('4 posts found')).toBeInTheDocument()
    })
    
    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i })
    await user.click(filtersButton)
    
    // Set date range
    const startDateInput = screen.getByLabelText('From')
    const endDateInput = screen.getByLabelText('To')
    await user.type(startDateInput, '2024-01-18')
    await user.type(endDateInput, '2024-01-27')
    
    // Should show posts within date range
    await waitFor(() => {
      expect(screen.getByText('2 posts found')).toBeInTheDocument()
    })
    
    expect(screen.getByText('TypeScript Best Practices')).toBeInTheDocument() // 2024-01-20
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument() // 2024-01-25
    expect(screen.queryByText('React Testing Guide')).not.toBeInTheDocument() // 2024-01-15
  })

  it('should combine multiple filters', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('4 posts found')).toBeInTheDocument()
    })
    
    // Search for "JavaScript"
    const searchInput = screen.getByRole('textbox', { name: /search posts/i })
    await user.type(searchInput, 'JavaScript')
    
    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i })
    await user.click(filtersButton)
    
    // Set user ID filter
    const userIdInput = screen.getByLabelText('User ID')
    await user.type(userIdInput, '1')
    
    // Set comment count range
    const minCommentsInput = screen.getByLabelText('Min')
    const maxCommentsInput = screen.getByLabelText('Max')
    await user.type(minCommentsInput, '5')
    await user.type(maxCommentsInput, '10')
    
    // Should show only JavaScript post from user 1 with 5-10 comments
    await waitFor(() => {
      expect(screen.getByText('1 post found')).toBeInTheDocument()
    })
    
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument()
  })

  it('should show no results when filters match nothing', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('4 posts found')).toBeInTheDocument()
    })
    
    // Search for non-existent term
    const searchInput = screen.getByRole('textbox', { name: /search posts/i })
    await user.type(searchInput, 'NonExistentTerm')
    
    // Should show no results
    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument()
    })
    
    expect(screen.getByText(/no posts match your current search criteria/i)).toBeInTheDocument()
    expect(screen.getByText('Search: "NonExistentTerm"')).toBeInTheDocument()
  })

  it('should clear all filters', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('4 posts found')).toBeInTheDocument()
    })
    
    // Add search query
    const searchInput = screen.getByRole('textbox', { name: /search posts/i })
    await user.type(searchInput, 'React')
    
    // Open filters and add user filter
    const filtersButton = screen.getByRole('button', { name: /filters/i })
    await user.click(filtersButton)
    
    const userIdInput = screen.getByLabelText('User ID')
    await user.type(userIdInput, '1')
    
    // Should show filtered results
    await waitFor(() => {
      expect(screen.getByText('1 post found')).toBeInTheDocument()
    })
    
    // Clear all filters
    const clearAllButton = screen.getByRole('button', { name: /clear all/i })
    await user.click(clearAllButton)
    
    // Should show all posts again
    await waitFor(() => {
      expect(screen.getByText('4 posts found')).toBeInTheDocument()
    })
    
    expect(searchInput).toHaveValue('')
  })

  it('should persist filters in URL', async () => {
    const user = userEvent.setup()
    render(<SearchablePosts />, { wrapper })
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('4 posts found')).toBeInTheDocument()
    })
    
    // Add search query
    const searchInput = screen.getByRole('textbox', { name: /search posts/i })
    await user.type(searchInput, 'React')
    
    // Open filters and add user filter
    const filtersButton = screen.getByRole('button', { name: /filters/i })
    await user.click(filtersButton)
    
    const userIdInput = screen.getByLabelText('User ID')
    await user.type(userIdInput, '1')
    
    // Should update URL
    await waitFor(() => {
      expect(mockHistory.replaceState).toHaveBeenCalledWith(
        {},
        '',
        expect.stringContaining('q=React')
      )
    })
    
    expect(mockHistory.replaceState).toHaveBeenCalledWith(
      {},
      '',
      expect.stringContaining('userId=1')
    )
  })

  it('should initialize from URL parameters', async () => {
    // Set initial URL parameters
    mockLocation.search = '?q=TypeScript&userId=2'
    
    render(<SearchablePosts />, { wrapper })
    
    // Should initialize with URL parameters
    const searchInput = screen.getByRole('textbox', { name: /search posts/i })
    expect(searchInput).toHaveValue('TypeScript')
    
    // Should show filtered results
    await waitFor(() => {
      expect(screen.getByText('1 post found')).toBeInTheDocument()
    })
    
    expect(screen.getByText('TypeScript Best Practices')).toBeInTheDocument()
  })
})