import { useQuery } from '@tanstack/react-query'
import { getUsers, getUserById } from '@/lib/users-api'

export const USERS_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_QUERY_KEYS.all, 'list'] as const,
  list: () => [...USERS_QUERY_KEYS.lists()] as const,
  details: () => [...USERS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...USERS_QUERY_KEYS.details(), id] as const,
}

export const useUsers = () => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.list(),
    queryFn: getUsers,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useUser = (id: number, enabled = true) => {
  return useQuery({
    queryKey: USERS_QUERY_KEYS.detail(id),
    queryFn: () => getUserById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
