import { eq } from 'drizzle-orm'

import { userTable } from '#/db/schemas'
import { orpcBase } from '#/orpc'

const authorProfileSelect = {
  id: userTable.id,
  name: userTable.name,
  username: userTable.username,
  image: userTable.image,
  banner: userTable.banner,
  bio: userTable.bio,
  pronouns: userTable.pronouns,
  location: userTable.location,
  education: userTable.education,
  work: userTable.work,
  verified: userTable.verified,
  createdAt: userTable.createdAt,
}

const getAuthorByUsernameHandler = orpcBase.users.getAuthorByUsername.handler(
  async ({ context, input, errors }) => {
    const [author] = await context.db
      .select(authorProfileSelect)
      .from(userTable)
      .where(eq(userTable.username, input.username))
      .limit(1)

    if (!author) {
      throw errors.NOT_FOUND({
        message: `Author @${input.username} not found.`,
      })
    }

    return author
  }
)

export const usersRouter = {
  getAuthorByUsername: getAuthorByUsernameHandler,
}
