import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api-endpoints'
import type { Post } from '@/types'
import axios from 'axios'

const postsApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export type GetPostsParams = {
  page?: number
  limit?: number
  userId?: number
}

export type GetPostsResult = {
  posts: Post[]
  total: number
  page: number
  limit: number
}

export const getPosts = async (
  params: GetPostsParams = {},
): Promise<GetPostsResult> => {
  const { page = 1, limit = 10, userId } = params

  try {
    let url = API_ENDPOINTS.POSTS
    const queryParams = new URLSearchParams()

    if (userId) {
      queryParams.append('userId', userId.toString())
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }

    const response = await postsApi.get<Post[]>(url)
    const allPosts = response.data

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPosts = allPosts.slice(startIndex, endIndex)

    return {
      posts: paginatedPosts,
      total: allPosts.length,
      page,
      limit,
    }
  } catch (error) {
    throw new Error(
      `Failed to fetch posts: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

export const getPostById = async (id: number): Promise<Post> => {
  try {
    const response = await postsApi.get<Post>(API_ENDPOINTS.POST_BY_ID(id))
    return response.data
  } catch (error) {
    throw new Error(
      `Failed to fetch post ${id}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

export const getPostsByUserId = async (
  userId: number,
  params: Omit<GetPostsParams, 'userId'> = {},
): Promise<GetPostsResult> => {
  return getPosts({ ...params, userId })
}

export const createPost = async (postData: Omit<Post, 'id'>): Promise<Post> => {
  try {
    const response = await postsApi.post<Post>(API_ENDPOINTS.POSTS, postData)
    return response.data
  } catch (error) {
    throw new Error(
      `Failed to create post: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

export const updatePost = async (
  id: number,
  postData: Partial<Post>,
): Promise<Post> => {
  try {
    const response = await postsApi.put<Post>(
      API_ENDPOINTS.POST_BY_ID(id),
      postData,
    )
    return response.data
  } catch (error) {
    throw new Error(
      `Failed to update post ${id}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

export const deletePost = async (id: number): Promise<void> => {
  try {
    await postsApi.delete(API_ENDPOINTS.POST_BY_ID(id))
  } catch (error) {
    throw new Error(
      `Failed to delete post ${id}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}
