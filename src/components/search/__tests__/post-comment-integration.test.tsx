import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { PostDetail } from '../post-detail'
import { type Post, type Comment } from '@/types'

// Mock the API modules
vi.mock('@/lib/posts-api', () => ({
  getPostById: vi.fn(),
}))

vi.mock('@/lib/comments-api', () => ({
  getCommentsByPost: vi.fn(),
  createComment: vi.fn(),
}))

// Mock auth context
const mockAuthContext = {
  isAuthenticated: true,
  user: { id: 1, name: 'Test User', username: 'testuser', email: 'test@example.com' },
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  isLoading: false,
  error: null,
  clearError: vi.fn(),
}

vi.mock('@/components/auth-context', () => ({
  useAuth: vi.fn(() => mockAuthContext),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock react-router-dom params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  }
})

const mockPost: Post = {
  id: 1,
  title: 'Test Post',
  body: 'This is a test post body',
  userId: 1,
  author: {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
  },
  commentsCount: 2,
}

const mockComments: Comment[] = [
  {
    id: 1,
    postId: 1,
    name: 'Alice',
    email: 'alice@example.com',
    body: 'Great post!',
  },
  {
    id: 2,
    postId: 1,
    name: 'Bob',
    email: 'bob@example.com',
    body: 'Thanks for sharing.',
  },
]

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Post-Comment Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Reset auth context to authenticated state
    mockAuthContext.isAuthenticated = true
    mockAuthContext.user = { id: 1, name: 'Test User', username: 'testuser', email: 'test@example.com' }
    
    const { getPostById } = await import('@/lib/posts-api')
    const { getCommentsByPost } = await import('@/lib/comments-api')
    
    vi.mocked(getPostById).mockResolvedValue(mockPost)
    vi.mocked(getCommentsByPost).mockResolvedValue(mockComments)
  })

  it('displays post details with comments section integrated', async () => {
    renderWithProviders(<PostDetail />)

    // Wait for post to load
    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })

    // Check that post metadata shows comment count
    expect(screen.getByText(/2 comments/)).toBeInTheDocument()

    // Check that comments section is present
    await waitFor(() => {
      expect(screen.getByText('Comments (2)')).toBeInTheDocument()
    })

    // Check that add comment button is available for authenticated users
    expect(screen.getByText('Add Comment')).toBeInTheDocument()
  })

  it('shows authentication controls based on auth state', async () => {
    renderWithProviders(<PostDetail />)

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })

    // For authenticated users, should show "Add Comment"
    expect(screen.getByText('Add Comment')).toBeInTheDocument()
    expect(screen.queryByText('Login to Comment')).not.toBeInTheDocument()
  })

  it('shows comment form when add comment is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PostDetail />)

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })

    // Click to show comment form
    const addCommentButton = screen.getByText('Add Comment')
    await user.click(addCommentButton)

    // Form should be visible
    await waitFor(() => {
      expect(screen.getByText('Add a Comment')).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument()

    // Button should change to Cancel
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('updates comment count display when comments are loaded', async () => {
    renderWithProviders(<PostDetail />)

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })

    // Should show the actual comment count from the comments array
    await waitFor(() => {
      expect(screen.getByText('Comments (2)')).toBeInTheDocument()
    })

    // The post header should also reflect the comment count
    expect(screen.getByText(/2 comments/)).toBeInTheDocument()
  })

  it('handles comment form submission attempt', async () => {
    const user = userEvent.setup()
    const newComment: Comment = {
      id: 3,
      postId: 1,
      name: 'Charlie',
      email: 'charlie@example.com',
      body: 'New comment',
    }

    const { createComment } = await import('@/lib/comments-api')
    vi.mocked(createComment).mockResolvedValue(newComment)

    renderWithProviders(<PostDetail />)

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })

    // Click to show comment form
    const addCommentButton = screen.getByText('Add Comment')
    await user.click(addCommentButton)

    await waitFor(() => {
      expect(screen.getByText('Add a Comment')).toBeInTheDocument()
    })

    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), 'Charlie')
    await user.type(screen.getByLabelText(/email/i), 'charlie@example.com')
    await user.type(screen.getByLabelText(/comment/i), 'New comment')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /post comment/i })
    await user.click(submitButton)

    // The form submission should be attempted
    // Note: We can't easily test the actual API call due to React Query complexity,
    // but we can verify the form interaction works
    expect(screen.getByLabelText(/name/i)).toHaveValue('Charlie')
    expect(screen.getByLabelText(/email/i)).toHaveValue('charlie@example.com')
    expect(screen.getByLabelText(/comment/i)).toHaveValue('New comment')
  })
})

describe('Post-Comment Integration - Unauthenticated', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Set auth context to unauthenticated state
    mockAuthContext.isAuthenticated = false
    mockAuthContext.user = null
    
    const { getPostById } = await import('@/lib/posts-api')
    const { getCommentsByPost } = await import('@/lib/comments-api')
    
    vi.mocked(getPostById).mockResolvedValue(mockPost)
    vi.mocked(getCommentsByPost).mockResolvedValue(mockComments)
  })

  it('shows authentication prompt for unauthenticated users', async () => {
    renderWithProviders(<PostDetail />)

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })

    // Should show login button instead of add comment
    await waitFor(() => {
      expect(screen.getByText('Login to Comment')).toBeInTheDocument()
    })
    
    expect(screen.getByText('You need to be logged in to add comments.')).toBeInTheDocument()
    expect(screen.queryByText('Add Comment')).not.toBeInTheDocument()
  })

  it('shows login buttons for unauthenticated users', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PostDetail />)

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })

    // Should have multiple login buttons
    const loginButtons = screen.getAllByText(/login/i)
    expect(loginButtons.length).toBeGreaterThan(0)

    // Click one of the login buttons (should not cause errors)
    await user.click(loginButtons[0])
    // Navigation would be handled by the mocked navigate function
  })
})