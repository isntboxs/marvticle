import { z } from 'zod'

import { voteDirectionEnum, votesThreadsTable } from '#/db/schemas'
import { createInsertSchema } from '#/schemas/drizzle-zod'

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
export const userVoteSchema = z.enum([...voteDirectionEnum.enumValues])

export const toggleVoteInputSchema = z.object({
  slug: z.string(),
  direction: userVoteSchema.refine(
    (value) => [...voteDirectionEnum.enumValues].includes(value),
    {
      error: `Vote must be one of ${voteDirectionEnum.enumValues.join(' or ')}`,
      path: ['direction'],
    }
  ),
})

export const toggleVoteOutputSchema = z.object({
  action: actionVoteSchema,
  userVote: userVoteSchema.nullable(),
  voteScore: z.coerce.number(),
})

export type ToggleVoteOutput = z.infer<typeof toggleVoteOutputSchema>
