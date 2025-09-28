import axios from 'axios'
import type { LoginCredentials, SignupData, AuthResponse } from '@/types/auth'
import type { User } from '@/types/user'
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api-endpoints'
import { authResponseSchema } from './validations'

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

function generateMockToken(userId: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: userId.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  )
  const signature = btoa('mock-signature')
  return `${header}.${payload}.${signature}`
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const response = await authApi.get<User[]>(API_ENDPOINTS.USERS)
    const users = response.data

    const user = users.find(
      (u) =>
        u.username === credentials.username || u.email === credentials.username,
    )

    if (!user) {
      throw new Error('Invalid username or password')
    }

    if (credentials.password.length < 6) {
      throw new Error('Invalid username or password')
    }

    const token = generateMockToken(user.id)
    const authResponse: AuthResponse = {
      token,
      user,
      expiresIn: 3600,
    }

    const validatedResponse = authResponseSchema.parse(authResponse)
    return validatedResponse
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Login failed: ${error.message}`)
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Login failed')
  }
}

export async function signup(userData: SignupData): Promise<AuthResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = await authApi.get<User[]>(API_ENDPOINTS.USERS)
    const existingUsers = response.data

    const existingUser = existingUsers.find(
      (u) => u.username === userData.username || u.email === userData.email,
    )

    if (existingUser) {
      if (existingUser.username === userData.username) {
        throw new Error('Username already exists')
      }
      if (existingUser.email === userData.email) {
        throw new Error('Email already exists')
      }
    }

    const newUserData = {
      name: userData.name,
      username: userData.username,
      email: userData.email,
    }

    const createResponse = await authApi.post<User>(
      API_ENDPOINTS.USERS,
      newUserData,
    )

    const newUser: User = {
      ...createResponse.data,
      id: createResponse.data.id || existingUsers.length + 1,
    }

    const token = generateMockToken(newUser.id)
    const authResponse: AuthResponse = {
      token,
      user: newUser,
      expiresIn: 3600,
    }

    const validatedResponse = authResponseSchema.parse(authResponse)
    return validatedResponse
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Signup failed: ${error.message}`)
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Signup failed')
  }
}

export async function logout(): Promise<void> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200))

    return Promise.resolve()
  } catch (error) {
    console.warn('Logout API call failed:', error)
    return Promise.resolve()
  }
}

export async function fetchUserById(userId: number): Promise<User> {
  try {
    const response = await authApi.get<User>(API_ENDPOINTS.USER_BY_ID(userId))
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch user: ${error.message}`)
    }
    throw new Error('Failed to fetch user')
  }
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const payload = JSON.parse(atob(token.split('.')[1]))
    const userId = parseInt(payload.sub)

    const response = await authApi.get<User>(API_ENDPOINTS.USER_BY_ID(userId))
    const user = response.data

    if (!user) {
      throw new Error('User not found')
    }

    const newToken = generateMockToken(userId)
    const authResponse: AuthResponse = {
      token: newToken,
      user,
      expiresIn: 3600,
    }

    const validatedResponse = authResponseSchema.parse(authResponse)
    return validatedResponse
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Token refresh failed: ${error.message}`)
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Token refresh failed')
  }
}

export const tokenUtils = {
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token)
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token')
  },

  removeToken: (): void => {
    localStorage.removeItem('auth_token')
  },

  isTokenValid: (token?: string): boolean => {
    const authToken = token || tokenUtils.getToken()
    if (!authToken) return false

    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp && payload.exp > currentTime
    } catch {
      return false
    }
  },

  getTokenExpiration: (token?: string): number | null => {
    const authToken = token || tokenUtils.getToken()
    if (!authToken) return null

    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]))
      return payload.exp ? payload.exp * 1000 : null
    } catch {
      return null
    }
  },

  getUserIdFromToken: (token?: string): number | null => {
    const authToken = token || tokenUtils.getToken()
    if (!authToken) return null

    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]))
      return payload.sub ? parseInt(payload.sub) : null
    } catch {
      return null
    }
  },
}
