import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api-endpoints'
import { type Comment } from '@/types'
import { type CommentFormData } from '@/lib/validations'

const jsonPlaceholderApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const commentsApi = {
  getCommentsByPost: async (postId: number): Promise<Comment[]> => {
    const response = await jsonPlaceholderApi.get<Comment[]>(
      API_ENDPOINTS.COMMENTS_BY_POST(postId),
    )
    return response.data
  },

  getComments: async (): Promise<Comment[]> => {
    const response = await jsonPlaceholderApi.get<Comment[]>(
      API_ENDPOINTS.COMMENTS,
    )
    return response.data
  },

  getComment: async (id: number): Promise<Comment> => {
    const response = await jsonPlaceholderApi.get<Comment>(
      API_ENDPOINTS.COMMENT_BY_ID(id),
    )
    return response.data
  },

  createComment: async (
    postId: number,
    commentData: CommentFormData,
  ): Promise<Comment> => {
    const response = await jsonPlaceholderApi.post<Comment>(
      API_ENDPOINTS.COMMENTS,
      {
        ...commentData,
        postId,
      },
    )
    return response.data
  },

  updateComment: async (
    id: number,
    commentData: Partial<CommentFormData>,
  ): Promise<Comment> => {
    const response = await jsonPlaceholderApi.put<Comment>(
      API_ENDPOINTS.COMMENT_BY_ID(id),
      commentData,
    )
    return response.data
  },

  deleteComment: async (id: number): Promise<void> => {
    await jsonPlaceholderApi.delete(API_ENDPOINTS.COMMENT_BY_ID(id))
  },
}
