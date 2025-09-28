import type { Post, SearchFilters } from '@/types'

export const filterPostsByQuery = (posts: Post[], query: string): Post[] => {
  if (!query.trim()) return posts

  const searchTerm = query.toLowerCase().trim()

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.body.toLowerCase().includes(searchTerm),
  )
}

export const filterPostsByDateRange = (
  posts: Post[],
  dateRange: { start: Date; end: Date },
): Post[] => {
  return posts.filter((post) => {
    if (!post.createdAt) return true

    const postDate = new Date(post.createdAt)
    return postDate >= dateRange.start && postDate <= dateRange.end
  })
}

export const filterPostsByCommentCount = (
  posts: Post[],
  commentCountRange: { min: number; max: number },
): Post[] => {
  return posts.filter((post) => {
    const commentCount = post.commentsCount || 0
    return (
      commentCount >= commentCountRange.min &&
      commentCount <= commentCountRange.max
    )
  })
}

export const filterPostsByUserId = (posts: Post[], userId: number): Post[] => {
  return posts.filter((post) => post.userId === userId)
}

export const applySearchFilters = (
  posts: Post[],
  filters: SearchFilters,
): Post[] => {
  let filteredPosts = posts

  if (filters.query) {
    filteredPosts = filterPostsByQuery(filteredPosts, filters.query)
  }

  if (filters.dateRange) {
    filteredPosts = filterPostsByDateRange(filteredPosts, filters.dateRange)
  }

  if (filters.commentCountRange) {
    filteredPosts = filterPostsByCommentCount(
      filteredPosts,
      filters.commentCountRange,
    )
  }

  if (filters.userId) {
    filteredPosts = filterPostsByUserId(filteredPosts, filters.userId)
  }

  return filteredPosts
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const createSearchQueryString = (filters: SearchFilters): string => {
  const params = new URLSearchParams()

  if (filters.query) {
    params.set('q', filters.query)
  }

  console.log('🚀 ~ createSearchQueryString ~ filters => ', filters)
  if (filters.dateRange) {
    params.set('startDate', filters.dateRange.start?.toISOString())
    params.set('endDate', filters.dateRange.end?.toISOString())
  }

  if (filters.commentCountRange) {
    params.set('minComments', filters.commentCountRange.min.toString())
    params.set('maxComments', filters.commentCountRange.max.toString())
  }

  if (filters.userId) {
    params.set('userId', filters.userId.toString())
  }

  return params.toString()
}

export const parseSearchQueryString = (queryString: string): SearchFilters => {
  const params = new URLSearchParams(queryString)
  const filters: SearchFilters = {
    query: params.get('q') || '',
  }

  const startDate = params.get('startDate')
  const endDate = params.get('endDate')
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      filters.dateRange = { start, end }
    }
  }

  const minComments = params.get('minComments')
  const maxComments = params.get('maxComments')
  if (minComments && maxComments) {
    const min = parseInt(minComments, 10)
    const max = parseInt(maxComments, 10)

    if (!isNaN(min) && !isNaN(max)) {
      filters.commentCountRange = { min, max }
    }
  }

  const userId = params.get('userId')
  if (userId) {
    filters.userId = parseInt(userId, 10)
  }

  return filters
}
