import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Post } from '@/types'

type PostCardProps = {
  post: Post
  onViewDetails?: (postId: number) => void
  onPrefetch?: (postId: number) => void
}

export function PostCard({ post, onViewDetails, onPrefetch }: PostCardProps) {
  const handleViewDetails = () => {
    onViewDetails?.(post.id)
  }

  const handleMouseEnter = () => {
    onPrefetch?.(post.id)
  }

  return (
    <Card 
      className="h-full transition-shadow hover:shadow-md"
      onMouseEnter={handleMouseEnter}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">
          {post.title}
        </CardTitle>
        {post.author && (
          <p className="text-sm text-muted-foreground">
            By {post.author.name} (@{post.author.username})
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {post.body}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {post.commentsCount !== undefined && (
              <span>{post.commentsCount} comments</span>
            )}
            {post.createdAt && (
              <span>{new Date(post.createdAt)?.toLocaleDateString()}</span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewDetails}
          >
            Read More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}