import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { type ReactNode } from 'react'
import { PostList } from '../post-list'
import * as usePostsHook from '@/hooks/use-posts'
import type { Post } from '@/types'

// Mock the hooks
vi.mock('@/hooks/use-posts')
const mockedUsePostsHook = vi.mocked(usePostsHook)

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock data
const mockPosts: Post[] = [
  {
    id: 1,
    title: 'First Post',
    body: 'First post body',
    userId: 1,
  },
  {
    id: 2,
    title: 'Second Post',
    body: 'Second post body',
    userId: 1,
  },
]

const mockPostsResult = {
  posts: mockPosts,
  total: 20,
  page: 1,
  limit: 9,
}

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('PostList', () => {
  const mockUsePosts = {
    data: mockPostsResult,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  }

  const mockUsePrefetchPost = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUsePostsHook.usePosts.mockReturnValue(mockUsePosts as any)
    mockedUsePostsHook.usePrefetchPost.mockReturnValue(mockUsePrefetchPost)
  })

  it('should render posts list correctly', () => {
    render(<PostList />, { wrapper: createWrapper() })

    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
  })

  it('should show loading skeleton when loading', () => {
    mockedUsePostsHook.usePosts.mockReturnValue({
      ...mockUsePosts,
      isLoading: true,
    } as any)

    render(<PostList />, { wrapper: createWrapper() })

    // Check for skeleton elements (they have animate-pulse class)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should show error state when there is an error', () => {
    const error = new Error('Failed to load posts')
    mockedUsePostsHook.usePosts.mockReturnValue({
      ...mockUsePosts,
      isError: true,
      error,
    } as any)

    render(<PostList />, { wrapper: createWrapper() })

    expect(
      screen.getByRole('heading', { name: 'Failed to load posts' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, element) => {
        return (
          element?.tagName === 'P' &&
          element?.textContent === 'Failed to load posts'
        )
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument()
  })

  it('should show empty state when no posts', () => {
    mockedUsePostsHook.usePosts.mockReturnValue({
      ...mockUsePosts,
      data: { posts: [], total: 0, page: 1, limit: 9 },
    } as any)

    render(<PostList />, { wrapper: createWrapper() })

    expect(screen.getByText('No posts found')).toBeInTheDocument()
    expect(
      screen.getByText('There are no posts to display at the moment.'),
    ).toBeInTheDocument()
  })

  it('should call refetch when retry button is clicked', () => {
    const refetch = vi.fn()
    mockedUsePostsHook.usePosts.mockReturnValue({
      ...mockUsePosts,
      isError: true,
      error: new Error('Network error'),
      refetch,
    } as any)

    render(<PostList />, { wrapper: createWrapper() })

    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)

    expect(refetch).toHaveBeenCalled()
  })

  it('should navigate to post detail when Read More is clicked', async () => {
    render(<PostList />, { wrapper: createWrapper() })

    const readMoreButtons = screen.getAllByRole('button', {
      name: /read more/i,
    })
    fireEvent.click(readMoreButtons[0])

    expect(mockNavigate).toHaveBeenCalledWith('/posts/1')
  })

  it('should prefetch post on hover', async () => {
    render(<PostList />, { wrapper: createWrapper() })

    const firstPostCard = screen
      .getByText('First Post')
      .closest('.transition-shadow')
    expect(firstPostCard).toBeInTheDocument()

    if (firstPostCard) {
      fireEvent.mouseEnter(firstPostCard)
      expect(mockUsePrefetchPost).toHaveBeenCalledWith(1)
    }
  })

  it('should show pagination when enabled and multiple pages exist', () => {
    render(<PostList showPagination={true} />, { wrapper: createWrapper() })

    expect(
      screen.getByRole('button', { name: /previous/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    // Use a more flexible text matcher for the pagination info
    expect(
      screen.getByText((_, element) => {
        return (
          (element?.tagName === 'P' &&
            element?.textContent?.includes('Showing 1 to 9 of 20 posts')) ||
          false
        )
      }),
    ).toBeInTheDocument()
  })

  it('should not show pagination when disabled', () => {
    render(<PostList showPagination={false} />, { wrapper: createWrapper() })

    expect(
      screen.queryByRole('button', { name: /previous/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /next/i }),
    ).not.toBeInTheDocument()
  })

  it('should update page when pagination is used', async () => {
    render(<PostList />, { wrapper: createWrapper() })

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    // Wait for the component to re-render with new params
    await waitFor(() => {
      expect(mockedUsePostsHook.usePosts).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 }),
      )
    })
  })

  it('should show fetching indicator when refetching', () => {
    mockedUsePostsHook.usePosts.mockReturnValue({
      ...mockUsePosts,
      isFetching: true,
    } as any)

    render(<PostList />, { wrapper: createWrapper() })

    expect(screen.getByText('Updating posts...')).toBeInTheDocument()
  })

  it('should use custom page size', () => {
    render(<PostList pageSize={5} />, { wrapper: createWrapper() })

    expect(mockedUsePostsHook.usePosts).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 5 }),
    )
  })

  it('should merge initial params with default params', () => {
    const initialParams = { userId: 1 }
    render(<PostList initialParams={initialParams} />, {
      wrapper: createWrapper(),
    })

    expect(mockedUsePostsHook.usePosts).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 9,
        userId: 1,
      }),
    )
  })
})
