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

export const getAuthorByUsernameParamsSchema = z.object({
  username: z.string().nonempty(),
})

export type AuthorProfile = z.infer<typeof authorProfileSchema>
export type GetAuthorByUsernameParams = z.infer<
  typeof getAuthorByUsernameParamsSchema
>
