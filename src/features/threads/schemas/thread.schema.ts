import { z } from 'zod'

import { threadsTable } from '#/db/schemas/threads'
import { userSelectSchema } from '#/features/users/schemas/users.schema'
import { userVoteSchema } from '#/features/votes/schemas/votes.schema'
import { createInsertSchema, createSelectSchema } from '#/schemas/drizzle-zod'

export const DEFAULT_MIN = 1

export const DEFAULT_THREADS_LIMIT = 10
export const MAX_THREADS_LIMIT = 50

export const threadSelectSchema = createSelectSchema(threadsTable)
  .pick({
    id: true,
    title: true,
    slug: true,
    content: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    author: userSelectSchema.pick({
      name: true,
      username: true,
      image: true,
      verified: true,
    }),
    voteScore: z.coerce.number(),
    userVote: userVoteSchema.nullable(),
  })

export const threadPaginationCursorSchema = threadSelectSchema.pick({
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
  items: threadSelectSchema.array(),
  nextCursor: z.string().nullable(),
})

export const getOneThreadBySlugSchema = threadSelectSchema.pick({
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
