import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Post } from '@/types'
import {
  getPosts,
  getPostById,
  getPostsByUserId,
  createPost,
  updatePost,
  deletePost,
  type GetPostsParams,
} from '@/lib/posts-api'

export const POSTS_QUERY_KEYS = {
  all: ['posts'] as const,
  lists: () => [...POSTS_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetPostsParams) =>
    [...POSTS_QUERY_KEYS.lists(), params] as const,
  details: () => [...POSTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...POSTS_QUERY_KEYS.details(), id] as const,
  byUser: (userId: number) =>
    [...POSTS_QUERY_KEYS.all, 'user', userId] as const,
}

export const usePosts = (params: GetPostsParams = {}) => {
  return useQuery({
    queryKey: POSTS_QUERY_KEYS.list(params),
    queryFn: () => getPosts(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const usePost = (id: number, enabled = true) => {
  return useQuery({
    queryKey: POSTS_QUERY_KEYS.detail(id),
    queryFn: () => getPostById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const usePostsByUser = (
  userId: number,
  params: Omit<GetPostsParams, 'userId'> = {},
) => {
  return useQuery({
    queryKey: POSTS_QUERY_KEYS.byUser(userId),
    queryFn: () => getPostsByUserId(userId, params),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEYS.all })
    },
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Post> }) =>
      updatePost(id, data),
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(
        POSTS_QUERY_KEYS.detail(updatedPost.id),
        updatedPost,
      )

      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEYS.lists() })
    },
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: POSTS_QUERY_KEYS.detail(deletedId),
      })

      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEYS.lists() })
    },
  })
}

export const usePrefetchPost = () => {
  const queryClient = useQueryClient()

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: POSTS_QUERY_KEYS.detail(id),
      queryFn: () => getPostById(id),
      staleTime: 5 * 60 * 1000,
    })
  }
}
