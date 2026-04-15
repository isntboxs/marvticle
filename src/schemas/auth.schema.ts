import { z } from 'zod'

export const signInSchema = z.object({
  username: z.string().nonempty({ error: 'Username is required' }),
  password: z.string().nonempty({ error: 'Password is required' }),
})

export const signUpSchema = z
  .object({
    name: z
      .string()
      .nonempty({ error: 'Name is required' })
      .max(255, { error: 'Name must be at most 255 characters' }),
    username: z
      .string()
      .nonempty({ error: 'Username is required' })
      .min(3, { error: 'Username must be at least 3 characters' })
      .max(50, { error: 'Username must be at most 50 characters' }),
    email: z
      .email({ error: 'Email is invalid' })
      .max(255, { error: 'Email must be at most 255 characters' }),
    password: z
      .string()
      .min(8, { error: 'Password must be at least 8 characters' }),
    confirmPassword: z
      .string()
      .nonempty({ error: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
