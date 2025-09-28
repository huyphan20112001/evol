import { Card, CardContent } from '@/components/ui/card'
import { type Comment } from '@/types'
import { formatDistanceToNow } from 'date-fns'

type CommentItemProps = {
  comment: Comment
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now'
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Just now'
    }
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {comment.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {comment.email}
            </p>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {comment.body}
        </p>
      </CardContent>
    </Card>
  )
}