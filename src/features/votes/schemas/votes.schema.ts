import { z } from 'zod'

import {
  pointsSchema,
  voteActionSchema,
  voteDirectionNullableSchema,
  voteDirectionSchema,
} from '#/schemas/drizzle-zod'

export const voteThreadInputSchema = z.object({
  slug: z.string().min(1, { message: 'Slug is required' }),
  direction: voteDirectionSchema,
})

export const voteThreadOutputSchema = z.object({
  action: voteActionSchema,
  points: pointsSchema,
  isVoted: voteDirectionNullableSchema,
})

export const voteCommentThreadInputSchema = z.object({
  id: z.uuid(),
  direction: voteDirectionSchema,
})

export const voteCommentThreadOutputSchema = z.object({
  action: voteActionSchema,
  points: pointsSchema,
  isVoted: voteDirectionNullableSchema,
})

export type VoteThreadOutput = z.infer<typeof voteThreadOutputSchema>
