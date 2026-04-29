import { z } from 'zod'

import { authorSchema } from '#/schemas/users.schema'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from '#/schemas/drizzle-zod'
import { postsTable } from '#/db/schemas'
import { isManagedFileKey } from '#/utils/storage'

const selectPostSchema = createSelectSchema(postsTable, {
  status: (s) => s.default('PUBLISHED'),
  viewsCount: (s) => s.int().nonnegative(),
  likesCount: (s) => s.int().nonnegative(),
  commentsCount: (s) => s.int().nonnegative(),
})

const insertPostSchema = createInsertSchema(postsTable, {
  title: (s) => s.trim().nonempty(),
  content: (s) => s.trim().nonempty(),
  coverImage: z.string().optional(),
  status: (s) =>
    s
      .default('PUBLISHED')
      .refine((value) => ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(value)),
})

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
    coverImage: true,
    content: true,
    status: true,
  })
  .extend({
    title: z.string().trim().min(1, { error: 'Title is required' }),
    coverImage: z.union([
      z.literal(''),
      z.string().refine(isManagedFileKey, {
        error: 'Cover image key is invalid',
      }),
    ]),
    content: z.string().trim().min(1, { error: 'Content is required' }),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  })

const updatePostBodyFieldsSchema = createUpdateSchema(postsTable)
  .pick({
    title: true,
    coverImage: true,
    content: true,
    status: true,
  })
  .extend({
    title: z.string().trim().min(1, { error: 'Title is required' }).optional(),
    coverImage: z
      .union([
        z.literal(''),
        z.string().refine(isManagedFileKey, {
          error: 'Cover image key is invalid',
        }),
      ])
      .optional(),
    content: z
      .string()
      .trim()
      .min(1, { error: 'Content is required' })
      .optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  })

const hasPostUpdateField = (
  value: Partial<
    Record<'title' | 'coverImage' | 'content' | 'status', unknown>
  >
) => {
  return (
    'title' in value ||
    'coverImage' in value ||
    'content' in value ||
    'status' in value
  )
}

export const updatePostBodySchema = updatePostBodyFieldsSchema
  .refine(hasPostUpdateField, {
    error: 'At least one field is required',
  })

export const updatePostInputSchema = updatePostBodyFieldsSchema
  .extend({
    id: z.uuid(),
  })
  .refine(hasPostUpdateField, {
    error: 'At least one field is required',
  })

export type CreatePostBodyInput = z.infer<typeof createPostBodySchema>
export type UpdatePostBodyInput = z.infer<typeof updatePostBodySchema>
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>

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
