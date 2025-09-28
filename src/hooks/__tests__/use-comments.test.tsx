import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCommentsByPost, useCommentOperations } from '../use-comments'
import { commentsApi } from '@/lib/comments-api'
import { type Comment } from '@/types'
import { type CommentFormData } from '@/lib/validations'

// Mock the comments API
vi.mock('@/lib/comments-api', () => ({
  commentsApi: {
    getCommentsByPost: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}))

const mockComment: Comment = {
  id: 1,
  postId: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  body: 'This is a test comment',
  createdAt: '2024-01-15T10:00:00Z',
}

const mockCommentFormData: CommentFormData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  body: 'This is a test comment',
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCommentsByPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch comments for a specific post', async () => {
    const mockComments = [mockComment]
    ;(commentsApi.getCommentsByPost as any).mockResolvedValue(mockComments)

    const { result } = renderHook(() => useCommentsByPost(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(commentsApi.getCommentsByPost).toHaveBeenCalledWith(1)
    expect(result.current.data).toEqual(mockComments)
  })

  it('should not fetch when postId is invalid', () => {
    renderHook(() => useCommentsByPost(0), {
      wrapper: createWrapper(),
    })

    expect(commentsApi.getCommentsByPost).not.toHaveBeenCalled()
  })

  it('should handle errors', async () => {
    const error = new Error('Network error')
    ;(commentsApi.getCommentsByPost as any).mockRejectedValue(error)

    const { result } = renderHook(() => useCommentsByPost(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })
})

describe('useCommentOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a comment', async () => {
    const newComment = { ...mockComment, id: 2 }
    ;(commentsApi.createComment as any).mockResolvedValue(newComment)

    const { result } = renderHook(() => useCommentOperations(), {
      wrapper: createWrapper(),
    })

    result.current.createComment.mutate({
      postId: 1,
      commentData: mockCommentFormData,
    })

    await waitFor(() => {
      expect(result.current.createComment.isSuccess).toBe(true)
    })

    expect(commentsApi.createComment).toHaveBeenCalledWith(1, mockCommentFormData)
  })

  it('should handle create comment errors', async () => {
    const error = new Error('Failed to create comment')
    ;(commentsApi.createComment as any).mockRejectedValue(error)

    const { result } = renderHook(() => useCommentOperations(), {
      wrapper: createWrapper(),
    })

    result.current.createComment.mutate({
      postId: 1,
      commentData: mockCommentFormData,
    })

    await waitFor(() => {
      expect(result.current.createComment.isError).toBe(true)
    })

    expect(result.current.createError).toEqual(error)
  })

  it('should update a comment', async () => {
    const updatedComment = { ...mockComment, body: 'Updated comment' }
    ;(commentsApi.updateComment as any).mockResolvedValue(updatedComment)

    const { result } = renderHook(() => useCommentOperations(), {
      wrapper: createWrapper(),
    })

    const updateData = { body: 'Updated comment' }
    result.current.updateComment.mutate({
      id: 1,
      commentData: updateData,
    })

    await waitFor(() => {
      expect(result.current.updateComment.isSuccess).toBe(true)
    })

    expect(commentsApi.updateComment).toHaveBeenCalledWith(1, updateData)
  })

  it('should delete a comment', async () => {
    ;(commentsApi.deleteComment as any).mockResolvedValue(undefined)

    const { result } = renderHook(() => useCommentOperations(), {
      wrapper: createWrapper(),
    })

    result.current.deleteComment.mutate(1)

    await waitFor(() => {
      expect(result.current.deleteComment.isSuccess).toBe(true)
    })

    expect(commentsApi.deleteComment).toHaveBeenCalledWith(1)
  })

  it('should provide loading states', () => {
    const { result } = renderHook(() => useCommentOperations(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
  })
})