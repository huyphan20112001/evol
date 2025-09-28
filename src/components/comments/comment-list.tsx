import { CommentItem } from './comment-item'
import { type Comment } from '@/types'
import { Loader2, MessageCircle } from 'lucide-react'

type CommentListProps = {
  comments: Comment[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
}

export const CommentList = ({
  comments,
  isLoading = false,
  error,
  emptyMessage = 'No comments yet. Be the first to comment!',
}: CommentListProps) => {
  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
        <p className="font-medium">Failed to load comments</p>
        <p className="mt-1">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageCircle className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}
