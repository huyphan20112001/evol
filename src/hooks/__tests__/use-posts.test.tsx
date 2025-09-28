import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import {
  usePosts,
  usePost,
  usePostsByUser,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  usePrefetchPost,
} from '../use-posts'
import * as postsApi from '@/lib/posts-api'
import type { Post } from '@/types'

// Mock the posts API
vi.mock('@/lib/posts-api')
const mockedPostsApi = vi.mocked(postsApi)

// Mock data
const mockPost: Post = {
  id: 1,
  title: 'Test Post',
  body: 'This is a test post body',
  userId: 1,
}

const mockPostsResult = {
  posts: [mockPost],
  total: 1,
  page: 1,
  limit: 10,
}

// Test wrapper with QueryClient
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

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('usePosts hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('usePosts', () => {
    it('should fetch posts successfully', async () => {
      mockedPostsApi.getPosts.mockResolvedValue(mockPostsResult)

      const { result } = renderHook(() => usePosts(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedPostsApi.getPosts).toHaveBeenCalledWith({})
      expect(result.current.data).toEqual(mockPostsResult)
    })

    it('should pass parameters to getPosts', async () => {
      mockedPostsApi.getPosts.mockResolvedValue(mockPostsResult)

      const params = { page: 2, limit: 5, userId: 1 }
      const { result } = renderHook(() => usePosts(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedPostsApi.getPosts).toHaveBeenCalledWith(params)
    })

    it('should handle error state', async () => {
      const errorMessage = 'Failed to fetch posts'
      mockedPostsApi.getPosts.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => usePosts(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect((result.current.error as Error).message).toBe(errorMessage)
    })
  })

  describe('usePost', () => {
    it('should fetch a single post successfully', async () => {
      mockedPostsApi.getPostById.mockResolvedValue(mockPost)

      const { result } = renderHook(() => usePost(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedPostsApi.getPostById).toHaveBeenCalledWith(1)
      expect(result.current.data).toEqual(mockPost)
    })

    it('should not fetch when enabled is false', async () => {
      mockedPostsApi.getPostById.mockResolvedValue(mockPost)

      const { result } = renderHook(() => usePost(1, false), {
        wrapper: createWrapper(),
      })

      // Wait a bit to ensure no call is made
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(mockedPostsApi.getPostById).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
    })

    it('should not fetch when id is 0', async () => {
      mockedPostsApi.getPostById.mockResolvedValue(mockPost)

      const { result } = renderHook(() => usePost(0), {
        wrapper: createWrapper(),
      })

      // Wait a bit to ensure no call is made
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(mockedPostsApi.getPostById).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
    })

    it('should handle error state', async () => {
      const errorMessage = 'Post not found'
      mockedPostsApi.getPostById.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => usePost(999), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect((result.current.error as Error).message).toBe(errorMessage)
    })
  })

  describe('usePostsByUser', () => {
    it('should fetch posts by user ID successfully', async () => {
      mockedPostsApi.getPostsByUserId.mockResolvedValue(mockPostsResult)

      const { result } = renderHook(() => usePostsByUser(1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedPostsApi.getPostsByUserId).toHaveBeenCalledWith(1, {})
      expect(result.current.data).toEqual(mockPostsResult)
    })

    it('should not fetch when userId is 0', async () => {
      mockedPostsApi.getPostsByUserId.mockResolvedValue(mockPostsResult)

      const { result } = renderHook(() => usePostsByUser(0), {
        wrapper: createWrapper(),
      })

      // Wait a bit to ensure no call is made
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(mockedPostsApi.getPostsByUserId).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
    })

    it('should pass additional parameters', async () => {
      mockedPostsApi.getPostsByUserId.mockResolvedValue(mockPostsResult)

      const params = { page: 2, limit: 5 }
      const { result } = renderHook(() => usePostsByUser(1, params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedPostsApi.getPostsByUserId).toHaveBeenCalledWith(1, params)
    })
  })

  describe('useCreatePost', () => {
    it('should create a post successfully', async () => {
      const newPost = { ...mockPost, id: 2 }
      mockedPostsApi.createPost.mockResolvedValue(newPost)

      const { result } = renderHook(() => useCreatePost(), {
        wrapper: createWrapper(),
      })

      const postData = {
        title: 'New Post',
        body: 'New post body',
        userId: 1,
      }

      result.current.mutate(postData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedPostsApi.createPost).toHaveBeenCalledWith(
        postData,
        expect.any(Object),
      )
      expect(result.current.data).toEqual(newPost)
    })

    it('should handle error state', async () => {
      const errorMessage = 'Failed to create post'
      mockedPostsApi.createPost.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCreatePost(), {
        wrapper: createWrapper(),
      })

      const postData = {
        title: 'New Post',
        body: 'New post body',
        userId: 1,
      }

      result.current.mutate(postData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect((result.current.error as Error).message).toBe(errorMessage)
    })
  })

  describe('useUpdatePost', () => {
    it('should update a post successfully', async () => {
      const updatedPost = { ...mockPost, title: 'Updated Title' }
      mockedPostsApi.updatePost.mockResolvedValue(updatedPost)

      const { result } = renderHook(() => useUpdatePost(), {
        wrapper: createWrapper(),
      })

      const updateData = { id: 1, data: { title: 'Updated Title' } }
      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedPostsApi.updatePost).toHaveBeenCalledWith(1, {
        title: 'Updated Title',
      })
      expect(result.current.data).toEqual(updatedPost)
    })

    it('should handle error state', async () => {
      const errorMessage = 'Failed to update post'
      mockedPostsApi.updatePost.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useUpdatePost(), {
        wrapper: createWrapper(),
      })

      const updateData = { id: 1, data: { title: 'Updated Title' } }
      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect((result.current.error as Error).message).toBe(errorMessage)
    })
  })

  describe('useDeletePost', () => {
    it('should delete a post successfully', async () => {
      mockedPostsApi.deletePost.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeletePost(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockedPostsApi.deletePost).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      )
    })

    it('should handle error state', async () => {
      const errorMessage = 'Failed to delete post'
      mockedPostsApi.deletePost.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDeletePost(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(1)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect((result.current.error as Error).message).toBe(errorMessage)
    })
  })

  describe('usePrefetchPost', () => {
    it('should prefetch a post', async () => {
      mockedPostsApi.getPostById.mockResolvedValue(mockPost)

      const { result } = renderHook(() => usePrefetchPost(), {
        wrapper: createWrapper(),
      })

      result.current(1)

      // Wait for prefetch to complete
      await waitFor(() => {
        expect(mockedPostsApi.getPostById).toHaveBeenCalledWith(1)
      })
    })
  })
})
