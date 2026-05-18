import { z } from 'zod'

import { userTable } from '#/db/schemas'
import { createSelectSchema, createUpdateSchema } from '#/schemas/drizzle-zod'

export const userSelectSchema = createSelectSchema(userTable, {
  displayUsername: (schema) => schema.optional(),
  image: (schema) => schema.optional(),
  banner: (schema) => schema.optional(),
  bio: (schema) => schema.optional(),
  pronouns: (schema) => schema.optional(),
  location: (schema) => schema.optional(),
  verified: (schema) => schema.optional().default(false),
}).pick({
  id: true,
  name: true,
  username: true,
  displayUsername: true,
  email: true,
  emailVerified: true,
  image: true,
  banner: true,
  bio: true,
  pronouns: true,
  location: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
})

export type UserSelectSchema = z.infer<typeof userSelectSchema>

export const userUpdateSchema = createUpdateSchema(userTable, {
  name: z
    .string()
    .nonempty({ error: 'Name is required' })
    .max(255, { error: 'Name must be at most 255 characters' }),
  username: z
    .string()
    .nonempty({ error: 'Username is required' })
    .min(3, { error: 'Username must be at least 3 characters' })
    .max(30, { error: 'Username must be at most 30 characters' }),
  bio: z.string().max(500, { error: 'Bio must be at most 500 characters' }),
  pronouns: z
    .string()
    .max(50, { error: 'Pronouns must be at most 50 characters' }),
  location: z
    .string()
    .max(100, { error: 'Location must be at most 100 characters' }),
  education: z
    .string()
    .max(100, { error: 'Education must be at most 100 characters' }),
  work: z.string().max(100, { error: 'Work must be at most 100 characters' }),
  image: z.string(),
  banner: z.string(),
})

export const getUserByUsernameParamsSchema = z.object({
  username: z.string().nonempty(),
})
