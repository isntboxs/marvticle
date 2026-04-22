import { createSchemaFactory } from 'drizzle-zod'
import { z } from 'zod'

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({
    coerce: {
      boolean: true,
      date: true,
      number: true,
    },
    zodInstance: z,
  })
