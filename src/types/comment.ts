export type Comment = {
  id: number
  postId: number
  name: string
  email: string
  body: string
  userId?: number
  createdAt?: string
}