import { z } from 'zod'

import { authorSchema } from '#/schemas/users.schema'
import { createInsertSchema, createSelectSchema } from '#/schemas/drizzle-zod'
import { postsTable } from '#/db/schemas'
import { POSTS_COVER_FOLDER } from '#/lib/storage'

const selectPostSchema = createSelectSchema(postsTable, {
  status: (s) => s.default('PUBLISHED'),
  viewsCount: (s) => s.int().nonnegative(),
  likesCount: (s) => s.int().nonnegative(),
  commentsCount: (s) => s.int().nonnegative(),
})

const insertPostSchema = createInsertSchema(postsTable, {
  title: (s) => s.trim().nonempty(),
  content: (s) => s.trim().nonempty(),
  status: (s) =>
    s
      .default('DRAFT')
      .refine((value) => ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(value)),
})

const postCoverImageKeySchema = z
  .string()
  .trim()
  .regex(new RegExp(`^${POSTS_COVER_FOLDER}/.+$`), {
    error: `Cover image key must be stored under ${POSTS_COVER_FOLDER}/`,
  })

const coverImageReferenceSchema = z.union([
  z.url({ error: 'Cover image URL is invalid' }),
  postCoverImageKeySchema,
])

export const postSchema = selectPostSchema
  .extend({
    author: authorSchema,
  })
  .omit({
    authorId: true,
  })

export const createPostBodySchema = insertPostSchema
  .pick({
    title: true,
    content: true,
    status: true,
    coverImageUrl: true,
  })
  .extend({
    coverImageUrl: coverImageReferenceSchema.optional(),
  })

export const createPostFormSchema = z.object({
  title: z.string().trim().min(1, { error: 'Title is required' }),
  coverImageUrl: z.union([z.literal(''), coverImageReferenceSchema]),
  content: z.string().trim().min(1, { error: 'Content is required' }),
})

export type CreatePostFormInput = z.infer<typeof createPostFormSchema>

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

export const getOnePostByUsernameAndSlugParamsSchema = z.object({
  username: z.string(),
  slug: z.string(),
})
