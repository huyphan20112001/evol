import { useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePost } from '@/hooks/use-posts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommentsSection } from '@/components/comments'
import { ArrowLeft, User, Calendar, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react'

export function PostDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const postId = id ? parseInt(id, 10) : 0
  const [currentCommentCount, setCurrentCommentCount] = useState<number | null>(null)

  const { 
    data: post, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = usePost(postId)

  const handleCommentCountChange = useCallback((count: number) => {
    setCurrentCommentCount(count)
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const handleRetry = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Back button skeleton */}
          <div className="h-10 bg-muted rounded w-24 animate-pulse" />
          
          {/* Post skeleton */}
          <Card>
            <CardHeader className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Failed to load post</h3>
              <p className="text-muted-foreground max-w-md">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
            </div>
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Post not found</h3>
              <p className="text-muted-foreground">
                The post you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Back button */}
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Post content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl leading-tight">
              {post.title}
            </CardTitle>
            
            {/* Post metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author.name} (@{post.author.username})</span>
                </div>
              )}
              
              {post.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.createdAt)?.toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>
                  {currentCommentCount !== null 
                    ? currentCommentCount 
                    : post.commentsCount || 0
                  } comments
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {post.body}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comments section */}
        <CommentsSection 
          postId={postId} 
          onCommentCountChange={handleCommentCountChange}
        />
      </div>
    </div>
  )
}