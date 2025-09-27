import { isAxiosError } from 'axios'
import { toast } from 'sonner'

export const handleError = (error: unknown) => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message || error.message
    toast.error(message)
  } else if (error instanceof Error) {
    toast.error(error.message)
  } else {
    toast.error('An unexpected error occurred')
  }
}
