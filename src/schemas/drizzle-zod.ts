import { createSchemaFactory } from 'drizzle-zod'
import { z } from 'zod'

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

export const pointsSchema = z.coerce.number().min(0)
export const commentsCountSchema = z.coerce.number().min(0)
export const userVoteSchema = z.enum([...voteDirectionEnum.enumValues])
