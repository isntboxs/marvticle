import { z } from 'zod'

import { commentsTable } from '#/db/schemas/comments'
import { createInsertSchema, createSelectSchema } from '#/schemas/drizzle-zod'

export const COMMENT_CONTENT_MAX_LENGTH = 5_000
export const DEFAULT_COMMENTS_LIMIT = 10
export const MAX_COMMENTS_LIMIT = 50
export const DEFAULT_MIN = 1

export const commentContentSchema = z
  .string()
  .trim()
  .min(1, { error: 'Comment is required' })
  .max(COMMENT_CONTENT_MAX_LENGTH, {
    error: `Comment must be at most ${COMMENT_CONTENT_MAX_LENGTH} characters long`,
  })

type CommentSelectSchema = {
  id: string
  createdAt: Date
  updatedAt: Date
  threadId: string
  parentId: string | null
  depth: number
  deletedAt: Date | null
  content: string
  isDeleted: boolean
  author: {
    id: string
    name: string
    username: string
    image: string | null
  }
  childComments?: CommentSelectSchema[]
}

export const commentSelectSchema: z.ZodType<CommentSelectSchema> =
  createSelectSchema(commentsTable)
    .pick({
      id: true,
      threadId: true,
      parentId: true,
      content: true,
      depth: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    })
    .extend({
      depth: z.coerce.number().int().min(0),
      content: z.string(),
      isDeleted: z.boolean(),
      author: z.object({
        id: z.uuid(),
        name: z.string(),
        username: z.string(),
        image: z.string().nullable(),
      }),
      childComments: z.lazy(() => commentSelectSchema.array().optional()),
    })

export const getThreadCommentsSchema = z.object({
  threadSlug: z.string(),
  limit: z.coerce
    .number()
    .int()
    .min(DEFAULT_MIN)
    .max(MAX_COMMENTS_LIMIT)
    .optional()
    .default(DEFAULT_COMMENTS_LIMIT),
  cursor: z.string().min(DEFAULT_MIN).optional(),
  includeReplies: z.coerce.boolean().optional().default(false),
})

export const getCommentRepliesSchema = z.object({
  parentId: z.uuid(),
  limit: z.coerce
    .number()
    .int()
    .min(DEFAULT_MIN)
    .max(MAX_COMMENTS_LIMIT)
    .optional()
    .default(DEFAULT_COMMENTS_LIMIT),
  cursor: z.string().min(DEFAULT_MIN).optional(),
})

export const commentPaginationCursorSchema = createSelectSchema(
  commentsTable
).pick({
  id: true,
  createdAt: true,
})

export const threadCommentsSchema = z.object({
  items: commentSelectSchema.array(),
  totalCount: z.coerce.number().int().min(0),
  nextCursor: z.string().nullable(),
})

export const commentCreateRootSchema = createInsertSchema(commentsTable, {
  content: () => commentContentSchema,
})
  .pick({
    content: true,
  })
  .extend({
    threadSlug: z.string(),
    content: commentContentSchema,
  })

export const commentCreateReplySchema = createInsertSchema(commentsTable, {
  content: () => commentContentSchema,
})
  .pick({
    content: true,
  })
  .extend({
    parentId: z.uuid(),
    content: commentContentSchema,
  })

export const commentUpdateSchema = z.object({
  id: z.uuid(),
  content: commentContentSchema,
})

export const commentDeleteSchema = z.object({
  id: z.uuid(),
})

export type CommentPaginationCursor = z.infer<
  typeof commentPaginationCursorSchema
>
