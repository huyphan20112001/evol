import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function PostSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-3 bg-muted rounded w-16 animate-pulse" />
            <div className="h-3 bg-muted rounded w-20 animate-pulse" />
          </div>
          <div className="h-8 bg-muted rounded w-20 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  )
}