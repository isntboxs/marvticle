import { z } from 'zod'

import {
  COMMENT_CONTENT_MAX_LENGTH,
  DEFAULT_COMMENTS_LIMIT,
  DEFAULT_MIN,
  MAX_COMMENTS_LIMIT,
} from '#/configs'
import { commentsTable } from '#/db/schemas/comments'
import {
  commentsCountSchema,
  createInsertSchema,
  createSelectSchema,
  pointsSchema,
  sortByCommentsSchema,
  voteDirectionNullableSchema,
} from '#/schemas/drizzle-zod'
import type { VoteDirectionNullable } from '#/schemas/drizzle-zod'

export const commentContentSchema = z
  .string()
  .trim()
  .min(DEFAULT_MIN, { error: 'Comment is required' })
  .max(COMMENT_CONTENT_MAX_LENGTH, {
    error: `Comment must be at most ${COMMENT_CONTENT_MAX_LENGTH} characters long`,
  })

type CommentSelectSchema = {
  id: string
  threadId: string
  parentId: string | null
  content: string
  depth: number
  isDeleted: boolean
  points: number
  commentsCount: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string
    username: string
    image: string | null
  }
  childComments?: CommentSelectSchema[]
  isVoted: VoteDirectionNullable
}

const childCommentsSchema = z.lazy(() => commentOutputSchema.array().optional())

export const commentOutputSchema: z.ZodType<CommentSelectSchema> =
  createSelectSchema(commentsTable)
    .pick({
      id: true,
      threadId: true,
      parentId: true,
      content: true,
      depth: true,
      points: true,
      commentsCount: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    })
    .extend({
      content: z.string(),
      depth: z.coerce.number().min(0),
      points: pointsSchema,
      commentsCount: commentsCountSchema,
      isDeleted: z.boolean(),
      author: z.object({
        id: z.uuid(),
        name: z.string(),
        username: z.string(),
        image: z.string().nullable(),
      }),
      childComments: childCommentsSchema,
      isVoted: voteDirectionNullableSchema,
    })

export const listCommentsThreadInputSchema = z.object({
  threadSlug: z.string(),
  limit: z.coerce
    .number()
    .int()
    .min(DEFAULT_MIN)
    .max(MAX_COMMENTS_LIMIT)
    .optional()
    .default(DEFAULT_COMMENTS_LIMIT),
  sortBy: sortByCommentsSchema.default('top'),
  cursor: z.string().min(DEFAULT_MIN).optional(),
  includeReplies: z.coerce.boolean().optional().default(false),
})

export const listCommentRepliesInputSchema = z.object({
  parentId: z.uuid(),
  limit: z.coerce
    .number()
    .int()
    .min(DEFAULT_MIN)
    .max(MAX_COMMENTS_LIMIT)
    .optional()
    .default(DEFAULT_COMMENTS_LIMIT),
  sortBy: sortByCommentsSchema.default('top'),
  cursor: z.string().min(DEFAULT_MIN).optional(),
})

export const listCommentsOutputSchema = z.object({
  items: commentOutputSchema.array(),
  nextCursor: z.string().nullable(),
})

export const createCommentThreadInputSchema = createInsertSchema(
  commentsTable,
  {
    content: () => commentContentSchema,
  }
)
  .pick({
    content: true,
  })
  .extend({
    threadSlug: z.string(),
    content: commentContentSchema,
  })

export const replyToCommentThreadInputSchema = createInsertSchema(
  commentsTable,
  {
    content: () => commentContentSchema,
  }
)
  .pick({
    content: true,
  })
  .extend({
    parentId: z.uuid(),
    content: commentContentSchema,
  })

export const commentUpdateInputSchema = z.object({
  id: z.uuid(),
  content: commentContentSchema,
})

export const commentDeleteInputSchema = z.object({
  id: z.uuid(),
})

export type ListCommentsOutput = z.infer<typeof listCommentsOutputSchema>
