import { z } from 'zod'

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores',
    ),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
})

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    username: z
      .string()
      .min(1, 'Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(255, 'Email must be less than 255 characters'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const authResponseSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  user: z.object({
    id: z.number(),
    name: z.string(),
    username: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    website: z.string().optional(),
    address: z
      .object({
        street: z.string(),
        suite: z.string(),
        city: z.string(),
        zipcode: z.string(),
        geo: z.object({
          lat: z.string(),
          lng: z.string(),
        }),
      })
      .optional(),
    company: z
      .object({
        name: z.string(),
        catchPhrase: z.string(),
        bs: z.string(),
      })
      .optional(),
  }),
  expiresIn: z.number().positive('Expiration time must be positive'),
})

export const commentSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  body: z
    .string()
    .min(1, 'Comment is required')
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type AuthResponseData = z.infer<typeof authResponseSchema>
export type CommentFormData = z.infer<typeof commentSchema>
