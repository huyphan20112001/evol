import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { commentSchema, type CommentFormData } from '@/lib/validations'
import { handleError } from '@/utils/error'

type CommentFormProps = {
  onSubmit: (data: CommentFormData) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export const CommentForm = ({
  onSubmit,
  isLoading = false,
  error,
}: CommentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: '',
      email: '',
      body: '',
    },
  })

  const handleFormSubmit = async (data: CommentFormData) => {
    try {
      await onSubmit(data)
      reset()
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Add a Comment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading || isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                disabled={isLoading || isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Comment</Label>
            <textarea
              id="body"
              placeholder="Write your comment here..."
              {...register('body')}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                errors.body ? 'border-red-500' : ''
              }`}
              disabled={isLoading || isSubmitting}
              rows={4}
            />
            {errors.body && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.body.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Post Comment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
