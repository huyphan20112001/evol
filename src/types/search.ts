export type SearchFilters = {
  query: string
  dateRange?: {
    start: Date
    end: Date
  }
  commentCountRange?: {
    min: number
    max: number
  }
  userId?: number
}