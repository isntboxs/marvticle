import { createSelectSchema } from '#/schemas/drizzle-zod'
import { userTable } from '#/db/schemas'

const selectUserSchema = createSelectSchema(userTable)

export const authorSchema = selectUserSchema.pick({
  id: true,
  name: true,
  username: true,
  image: true,
})
