import { z } from 'zod'

import { DEFAULT_MIN } from '#/configs'
import { threadsTable } from '#/db/schemas/threads'
import { userSelectSchema } from '#/features/users/schemas/users.schema'
import {
  commentsCountSchema,
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  feedThreadSchema,
  limitThreadsSchema,
  periodThreadSchema,
  pointsSchema,
  sortThreadSchema,
  voteDirectionNullableSchema,
} from '#/schemas/drizzle-zod'

const slugSchema = z.string().min(DEFAULT_MIN, { message: 'Slug is required' })

export const threadOutputSchema = createSelectSchema(threadsTable)
  .pick({
    id: true,
    title: true,
    slug: true,
    content: true,
    points: true,
    commentsCount: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    slug: slugSchema,
    points: pointsSchema,
    commentsCount: commentsCountSchema,
    author: userSelectSchema.pick({
      id: true,
      name: true,
      username: true,
      image: true,
      verified: true,
    }),
    isVoted: voteDirectionNullableSchema,
  })

export const listThreadsInputSchema = z.object({
  feed: feedThreadSchema.optional().default('discover'),
  sort: sortThreadSchema.optional(),
  period: periodThreadSchema.optional().default('all'),
  limit: limitThreadsSchema,
  cursor: z.string().optional(),
})

export const threadsOutputSchema = z.object({
  items: threadOutputSchema.array(),
  nextCursor: z.string().nullable(),
})

export const getOneThreadInputSchema = threadOutputSchema.pick({
  slug: true,
})

export const deleteThreadInputSchema = threadOutputSchema.pick({
  slug: true,
})

export const deleteThreadOutputSchema = z.object({
  success: z.boolean(),
})

export const threadInsertSchema = createInsertSchema(threadsTable, {
  title: (s) =>
    s
      .nonempty({ error: 'Title is required' })
      .max(255, { message: 'Title must be at most 255 characters long' }),
  content: (s) => s.nonempty({ error: 'Content is required' }),
}).pick({
  title: true,
  content: true,
})

export const threadUpdateInputSchema = createUpdateSchema(threadsTable, {
  title: (s) =>
    s
      .nonempty({ error: 'Title is required' })
      .max(255, { message: 'Title must be at most 255 characters long' }),
  content: (s) => s.nonempty({ error: 'Content is required' }),
})
  .pick({
    slug: true,
    title: true,
    content: true,
  })
  .extend({
    slug: z.string().min(1, { message: 'Slug is required' }),
  })
