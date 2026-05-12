import { z } from 'zod'

import { createSelectSchema } from '#/schemas/drizzle-zod'
import { userTable } from '#/db/schemas'

const selectUserSchema = createSelectSchema(userTable)

export const authorSchema = selectUserSchema.pick({
  id: true,
  name: true,
  username: true,
  image: true,
})

export const authorProfileSchema = selectUserSchema.pick({
  id: true,
  name: true,
  username: true,
  image: true,
  banner: true,
  bio: true,
  pronouns: true,
  location: true,
  education: true,
  work: true,
  verified: true,
  createdAt: true,
})

export const userProfileSchema = selectUserSchema.pick({
  id: true,
  name: true,
  email: true,
  username: true,
  image: true,
  banner: true,
  bio: true,
  pronouns: true,
  location: true,
  education: true,
  work: true,
  verified: true,
  createdAt: true,
})

export const getAuthorByUsernameParamsSchema = z.object({
  username: z.string().nonempty(),
})

export const getUserByUsernameParamsSchema = z.object({
  username: z.string().nonempty(),
})

export const generalSettingsSchema = z.object({
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

export type AuthorProfile = z.infer<typeof authorProfileSchema>
export type GetAuthorByUsernameParams = z.infer<
  typeof getAuthorByUsernameParamsSchema
>
