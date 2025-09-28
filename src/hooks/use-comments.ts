import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '@/lib/comments-api'
import { type Comment } from '@/types'
import { type CommentFormData } from '@/lib/validations'
import { POSTS_QUERY_KEYS } from './use-posts'

export const commentKeys = {
  all: ['comments'] as const,
  byPost: (postId: number) => [...commentKeys.all, 'post', postId] as const,
  byId: (id: number) => [...commentKeys.all, 'detail', id] as const,
}

export function useCommentsByPost(postId: number) {
  return useQuery({
    queryKey: commentKeys.byPost(postId),
    queryFn: () => commentsApi.getCommentsByPost(postId),
    enabled: !!postId && postId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useComments() {
  return useQuery({
    queryKey: commentKeys.all,
    queryFn: commentsApi.getComments,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useComment(id: number) {
  return useQuery({
    queryKey: commentKeys.byId(id),
    queryFn: () => commentsApi.getComment(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCommentOperations() {
  const queryClient = useQueryClient()

  const createComment = useMutation({
    mutationFn: ({
      postId,
      commentData,
    }: {
      postId: number
      commentData: CommentFormData
    }) => commentsApi.createComment(postId, commentData),
    onSuccess: (newComment) => {
      queryClient.setQueryData<Comment[]>(
        commentKeys.byPost(newComment.postId),
        (oldComments) => {
          if (!oldComments) return [newComment]
          return [...oldComments, newComment]
        },
      )

      queryClient.invalidateQueries({
        queryKey: commentKeys.byPost(newComment.postId),
      })

      queryClient.invalidateQueries({
        queryKey: commentKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: POSTS_QUERY_KEYS.detail(newComment.postId),
      })

      queryClient.invalidateQueries({
        queryKey: POSTS_QUERY_KEYS.lists(),
      })
    },
    onError: (error) => {
      console.error('Failed to create comment:', error)
    },
  })

  const updateComment = useMutation({
    mutationFn: ({
      id,
      commentData,
    }: {
      id: number
      commentData: Partial<CommentFormData>
    }) => commentsApi.updateComment(id, commentData),
    onSuccess: (updatedComment) => {
      queryClient.setQueryData(
        commentKeys.byId(updatedComment.id),
        updatedComment,
      )

      queryClient.setQueryData<Comment[]>(
        commentKeys.byPost(updatedComment.postId),
        (oldComments) => {
          if (!oldComments) return [updatedComment]
          return oldComments.map((comment) =>
            comment.id === updatedComment.id ? updatedComment : comment,
          )
        },
      )

      queryClient.invalidateQueries({
        queryKey: commentKeys.byPost(updatedComment.postId),
      })
    },
    onError: (error) => {
      console.error('Failed to update comment:', error)
    },
  })

  const deleteComment = useMutation({
    mutationFn: (id: number) => commentsApi.deleteComment(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: commentKeys.byId(deletedId),
      })

      queryClient.invalidateQueries({
        queryKey: commentKeys.all,
      })
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error)
    },
  })

  return {
    createComment,
    updateComment,
    deleteComment,
    isCreating: createComment.isPending,
    isUpdating: updateComment.isPending,
    isDeleting: deleteComment.isPending,
    createError: createComment.error,
    updateError: updateComment.error,
    deleteError: deleteComment.error,
  }
}
