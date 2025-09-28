import { API_BASE_URL } from '@/constants/api-endpoints'
import type { User } from '@/types'
import axios from 'axios'

const usersApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await usersApi.get<User[]>('/users')
    return response.data
  } catch (error) {
    throw new Error(
      `Failed to fetch users: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await usersApi.get<User>(`/users/${id}`)
    return response.data
  } catch (error) {
    throw new Error(
      `Failed to fetch user ${id}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}
