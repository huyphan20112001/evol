import type { User } from './user'

export type LoginCredentials = {
  username: string
  password: string
}

export type SignupData = {
  name: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

export type AuthResponse = {
  token: string
  user: User
  expiresIn: number
}