import { createSchemaFactory } from 'drizzle-zod'
import { z } from 'zod'

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({
    coerce: {
      date: true,
      number: true,
    },
    zodInstance: z,
  })
