import type { User } from './user'

export type Post = {
  id: number
  title: string
  body: string
  userId: number
  author?: User
  commentsCount?: number
  createdAt?: string
}

export type PostsResponse = {
  data: Post[]
  total: number
  page: number
  limit: number
}