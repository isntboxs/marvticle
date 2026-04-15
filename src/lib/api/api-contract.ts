import { z } from 'zod'

export const fieldErrorMapSchema = z.record(z.string(), z.string())

export type FieldErrorMap = Record<string, string>

export const apiErrorSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
  errors: fieldErrorMapSchema.optional(),
})

export const createApiSuccessSchema = <TSchema extends z.ZodTypeAny>(
  dataSchema: TSchema
): z.ZodObject<{
  success: z.ZodLiteral<true>
  message: z.ZodString
  data: TSchema
}> =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export type ApiErrorResponse = z.infer<typeof apiErrorSchema>

export type ApiSuccessResponse<T> = {
  success: true
  message: string
  data: T
}
