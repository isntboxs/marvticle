import { createSchemaFactory } from 'drizzle-zod'
import { z } from 'zod'

import {
  DEFAULT_MIN,
  DEFAULT_THREADS_LIMIT,
  MAX_THREADS_LIMIT,
} from '#/configs'
import { voteDirectionEnum } from '#/db/schemas'

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({
    coerce: {
      boolean: true,
      date: true,
      number: true,
    },
    zodInstance: z,
  })

export const limitThreadsSchema = z.coerce
  .number()
  .int()
  .min(DEFAULT_MIN)
  .max(MAX_THREADS_LIMIT)
  .default(DEFAULT_THREADS_LIMIT)
export const feedThreadSchema = z.enum(['latest', 'discover'])
export const sortThreadSchema = z.enum(['top'])
export const periodThreadSchema = z.enum(['week', 'month', 'year', 'all'])
export const sortByCommentsSchema = z.enum(['top', 'latest', 'oldest'])

export const pointsSchema = z.coerce.number()
export const commentsCountSchema = z.coerce.number().min(0)
export const voteActionSchema = z.enum(['VOTED', 'UNVOTED', 'CHANGED'])
export const voteDirectionSchema = z.enum([...voteDirectionEnum.enumValues])
export const voteDirectionNullableSchema = voteDirectionSchema
  .nullable()
  .default(null)

export const latestCursorSchema = z.object({
  mode: z.literal('latest'),
  id: z.uuid(),
  createdAt: z.coerce.date(),
})
export const topCursorSchema = z.object({
  mode: z.literal('top'),
  id: z.uuid(),
  points: z.coerce.number(),
})
export const discoverCursorSchema = z.object({
  mode: z.literal('discover'),
  id: z.uuid(),
  trendingScore: z.coerce.number(),
})

export const cursorPayloadSchema = z.discriminatedUnion('mode', [
  latestCursorSchema,
  topCursorSchema,
  discoverCursorSchema,
])

export type SortByComments = z.infer<typeof sortByCommentsSchema>
export type VoteAction = z.infer<typeof voteActionSchema>
export type VoteDirectionNullable = z.infer<typeof voteDirectionNullableSchema>
export type CursorPayload = z.infer<typeof cursorPayloadSchema>
