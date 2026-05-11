import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, {
      error: 'Password must be at least 8 characters long',
    }),
    newPassword: z.string().min(8, {
      error: 'Password must be at least 8 characters long',
    }),
    confirmPassword: z.string().min(8, {
      error: 'Password must be at least 8 characters long',
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
