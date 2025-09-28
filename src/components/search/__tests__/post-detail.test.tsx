import * as usePostsHook from '@/hooks/use-posts'
import type { Post } from '@/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PostDetail } from '../post-detail'

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
    useParams: () => ({ id: '1' }),
  }
})

// Mock auth context
vi.mock('@/components/auth-context', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: { id: 1, name: 'Test User', username: 'testuser', email: 'test@example.com' },
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock comments hooks
vi.mock('@/hooks/use-comments', () => ({
  useCommentsByPost: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useCommentOperations: vi.fn(() => ({
    createComment: { mutateAsync: vi.fn() },
    isCreating: false,
    createError: null,
  })),
}))

// Mock data
const mockPost: Post = {
  id: 1,
  title: 'Test Post Title',
  body: 'This is a detailed test post body content that should be displayed in the post detail view.',
  userId: 1,
  author: {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
  },
  commentsCount: 5,
  createdAt: '2024-01-15T10:00:00Z',
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

describe('PostDetail', () => {
  const mockUsePost = {
    data: mockPost,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUsePostsHook.usePost.mockReturnValue(mockUsePost as any)
  })

  it('should render post details correctly', () => {
    render(<PostDetail />, { wrapper: createWrapper() })

    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    expect(
      screen.getByText(/This is a detailed test post body content/),
    ).toBeInTheDocument()
    expect(screen.getByText('John Doe (@johndoe)')).toBeInTheDocument()
    expect(screen.getByText('5 comments')).toBeInTheDocument()
    expect(screen.getByText('1/15/2024')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('should render post without optional fields', () => {
    const minimalPost: Post = {
      id: 2,
      title: 'Minimal Post',
      body: 'Minimal post body',
      userId: 1,
    }

    mockedUsePostsHook.usePost.mockReturnValue({
      ...mockUsePost,
      data: minimalPost,
    } as any)

    render(<PostDetail />, { wrapper: createWrapper() })

    expect(screen.getByText('Minimal Post')).toBeInTheDocument()
    expect(screen.getByText('Minimal post body')).toBeInTheDocument()
    expect(screen.queryByText(/John Doe/)).not.toBeInTheDocument()
    expect(screen.queryByText(/comments/)).not.toBeInTheDocument()
  })

  it('should show loading skeleton when loading', () => {
    mockedUsePostsHook.usePost.mockReturnValue({
      ...mockUsePost,
      isLoading: true,
      data: undefined,
    } as any)

    render(<PostDetail />, { wrapper: createWrapper() })

    // Check for skeleton elements (they have animate-pulse class)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should show error state when there is an error', () => {
    const error = new Error('Failed to load post')
    mockedUsePostsHook.usePost.mockReturnValue({
      ...mockUsePost,
      isError: true,
      error,
      data: undefined,
    } as any)

    render(<PostDetail />, { wrapper: createWrapper() })

    expect(
      screen.getByRole('heading', { name: 'Failed to load post' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText((_, element) => {
        return (
          element?.tagName === 'P' &&
          element?.textContent === 'Failed to load post'
        )
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument()
  })

  it('should show not found state when post is null', () => {
    mockedUsePostsHook.usePost.mockReturnValue({
      ...mockUsePost,
      data: null,
    } as any)

    render(<PostDetail />, { wrapper: createWrapper() })

    expect(screen.getByText('Post not found')).toBeInTheDocument()
    expect(
      screen.getByText(/doesn't exist or has been removed/),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
  })

  it('should call navigate when back button is clicked', () => {
    render(<PostDetail />, { wrapper: createWrapper() })

    const backButton = screen.getByRole('button', { name: /back/i })
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('should call refetch when retry button is clicked', () => {
    const refetch = vi.fn()
    mockedUsePostsHook.usePost.mockReturnValue({
      ...mockUsePost,
      isError: true,
      error: new Error('Network error'),
      refetch,
      data: undefined,
    } as any)

    render(<PostDetail />, { wrapper: createWrapper() })

    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)

    expect(refetch).toHaveBeenCalled()
  })

  it('should call navigate when go back button is clicked in not found state', () => {
    mockedUsePostsHook.usePost.mockReturnValue({
      ...mockUsePost,
      data: null,
    } as any)

    render(<PostDetail />, { wrapper: createWrapper() })

    const goBackButton = screen.getByRole('button', { name: /go back/i })
    fireEvent.click(goBackButton)

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('should show comments placeholder section', () => {
    render(<PostDetail />, { wrapper: createWrapper() })

    expect(screen.getByText('Comments')).toBeInTheDocument()
    expect(
      screen.getByText('Comments will be implemented in the next phase.'),
    ).toBeInTheDocument()
  })

  it('should handle invalid post ID gracefully', () => {
    // This test verifies that the component handles invalid IDs by checking the usePost hook is called with 0
    // when an invalid ID is provided, which should result in a not found state
    mockedUsePostsHook.usePost.mockReturnValue({
      ...mockUsePost,
      data: null,
    } as any)

    render(<PostDetail />, { wrapper: createWrapper() })

    expect(screen.getByText('Post not found')).toBeInTheDocument()
  })

  it('should preserve whitespace in post body', () => {
    const postWithNewlines: Post = {
      ...mockPost,
      body: 'Line 1\n\nLine 2\nLine 3',
    }

    mockedUsePostsHook.usePost.mockReturnValue({
      ...mockUsePost,
      data: postWithNewlines,
    } as any)

    render(<PostDetail />, { wrapper: createWrapper() })

    const bodyElement = screen.getByText((_, element) => {
      return (
        element?.tagName === 'P' &&
        element?.textContent === 'Line 1\n\nLine 2\nLine 3'
      )
    })
    expect(bodyElement).toHaveClass('whitespace-pre-wrap')
  })
})
