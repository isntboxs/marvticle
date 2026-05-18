import { z } from 'zod'

import {
  DEFAULT_MIN,
  DEFAULT_THREADS_LIMIT,
  MAX_THREADS_LIMIT,
} from '#/configs'
import { threadsTable } from '#/db/schemas/threads'
import { userSelectSchema } from '#/features/users/schemas/users.schema'
import {
  commentsCountSchema,
  createInsertSchema,
  createSelectSchema,
  pointsSchema,
  userVoteSchema,
} from '#/schemas/drizzle-zod'

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
    points: pointsSchema,
    commentsCount: commentsCountSchema,
    author: userSelectSchema.pick({
      id: true,
      name: true,
      username: true,
      image: true,
      verified: true,
    }),
    isVoted: userVoteSchema.nullable().default(null),
  })

export const threadPaginationCursorSchema = threadOutputSchema.pick({
  id: true,
  createdAt: true,
})

export type ThreadPaginationCursor = z.infer<
  typeof threadPaginationCursorSchema
>

export const getManyThreadsParamsSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(DEFAULT_MIN)
    .max(MAX_THREADS_LIMIT)
    .default(DEFAULT_THREADS_LIMIT),
  cursor: z.string().min(DEFAULT_MIN).optional(),
})

export const threadsSchema = z.object({
  items: threadOutputSchema.array(),
  nextCursor: z.string().nullable(),
})

export const getOneThreadBySlugSchema = threadOutputSchema.pick({
  slug: true,
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
