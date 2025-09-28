import React, { useState } from 'react'
import { CommentList } from './comment-list'
import { CommentForm } from './comment-form'
import { useCommentsByPost, useCommentOperations } from '@/hooks/use-comments'
import { useAuth } from '@/components/auth-context'
import { type CommentFormData } from '@/lib/validations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { handleError } from '@/utils/error'
import { PATHNAME } from '@/constants/common'

type CommentsSectionProps = {
  postId: number
  onCommentCountChange?: (count: number) => void
}

export const CommentsSection = ({
  postId,
  onCommentCountChange,
}: CommentsSectionProps) => {
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const { data: comments = [], isLoading, error } = useCommentsByPost(postId)

  const { createComment, isCreating, createError } = useCommentOperations()

  React.useEffect(() => {
    if (onCommentCountChange) {
      onCommentCountChange(comments.length)
    }
  }, [comments.length, onCommentCountChange])

  const handleSubmitComment = async (commentData: CommentFormData) => {
    if (!isAuthenticated) {
      navigate(PATHNAME.LOGIN)
      return
    }

    try {
      await createComment.mutateAsync({ postId, commentData })
      setShowForm(false)
    } catch (error) {
      handleError(error)
    }
  }

  const handleToggleForm = () => {
    if (!isAuthenticated) {
      navigate(PATHNAME.LOGIN)
      return
    }
    setShowForm(!showForm)
  }

  const handleLoginRedirect = () => {
    navigate(PATHNAME.LOGIN)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Comments ({comments.length})
          </CardTitle>
          {isAuthenticated ? (
            <button
              onClick={handleToggleForm}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {showForm ? 'Cancel' : 'Add Comment'}
            </button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoginRedirect}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Login to Comment
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Authentication message for unauthenticated users */}
        {!isAuthenticated && !showForm && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="mb-2">You need to be logged in to add comments.</p>
            <Button variant="outline" onClick={handleLoginRedirect}>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </div>
        )}

        {/* Comment Form - only show if authenticated */}
        {showForm && isAuthenticated && (
          <>
            <CommentForm
              onSubmit={handleSubmitComment}
              isLoading={isCreating}
              error={createError?.message || null}
            />
            <Separator />
          </>
        )}

        {/* Comments List */}
        <CommentList
          comments={comments}
          isLoading={isLoading}
          error={error?.message || null}
          emptyMessage="No comments yet. Be the first to share your thoughts!"
        />
      </CardContent>
    </Card>
  )
}
