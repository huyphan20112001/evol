export const API_BASE_URL = 'https://jsonplaceholder.typicode.com'

export const API_ENDPOINTS = {
  POSTS: '/posts',
  POST_BY_ID: (id: number) => `/posts/${id}`,
  POSTS_BY_USER: (userId: number) => `/posts?userId=${userId}`,

  COMMENTS: '/comments',
  COMMENT_BY_ID: (id: number) => `/comments/${id}`,
  COMMENTS_BY_POST: (postId: number) => `/posts/${postId}/comments`,

  USERS: '/users',
  USER_BY_ID: (id: number) => `/users/${id}`,
} as const
