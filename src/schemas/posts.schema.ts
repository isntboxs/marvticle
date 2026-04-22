import { z } from 'zod'

import { authorSchema } from '#/schemas/users.schema'
import { createInsertSchema, createSelectSchema } from '#/schemas/drizzle-zod'
import { postsTable } from '#/db/schemas'

const selectPostSchema = createSelectSchema(postsTable, {
  status: (s) => s.default('PUBLISHED'),
  viewsCount: (s) => s.int().nonnegative(),
  likesCount: (s) => s.int().nonnegative(),
  commentsCount: (s) => s.int().nonnegative(),
})

const insertPostSchema = createInsertSchema(postsTable)

export const postSchema = selectPostSchema
  .extend({
    author: authorSchema,
  })
  .omit({
    authorId: true,
  })

export const createPostBodySchema = insertPostSchema.pick({
  title: true,
  slug: true,
  coverImageUrl: true,
  content: true,
  status: true,
})

export const getManyPostsParamsSchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const postPaginationCursorSchema = z.object({
  createdAt: z.coerce.date(),
  id: z.uuid(),
})

export const postsPageSchema = z.object({
  items: z.array(postSchema),
  nextCursor: z.string().nullable(),
})

export const getOnePostSlugParamsSchema = z.object({
  slug: z.string(),
})
