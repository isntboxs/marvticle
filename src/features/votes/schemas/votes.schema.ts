import { z } from 'zod'

import { voteDirectionEnum, votesThreadsTable } from '#/db/schemas'
import {
  createInsertSchema,
  voteDirectionNullableSchema,
  voteDirectionSchema,
} from '#/schemas/drizzle-zod'

export const toggleVoteSchema = createInsertSchema(votesThreadsTable, {
  direction: (schema) =>
    schema.refine(
      (value) => [...voteDirectionEnum.enumValues].includes(value),
      {
        error: `Vote must be one of ${voteDirectionEnum.enumValues.join(' or ')}`,
        path: ['direction'],
      }
    ),
}).pick({
  userId: true,
  threadId: true,
  direction: true,
})

const actionVoteSchema = z.enum(['VOTED', 'UNVOTED', 'CHANGED'])

export const toggleVoteInputSchema = z.object({
  slug: z.string(),
  direction: voteDirectionSchema,
})

export const voteThreadOutputSchema = z.object({
  action: actionVoteSchema,
  userVote: voteDirectionNullableSchema,
  voteScore: z.coerce.number(),
})

export type VoteThreadOutput = z.infer<typeof voteThreadOutputSchema>
