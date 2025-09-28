export type ApiResponse<T> = {
  data: T
  message?: string
  success: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type AppError = {
  code: string
  message: string
  details?: unknown
}

export type ValidationError = {
  field: string
  message: string
}