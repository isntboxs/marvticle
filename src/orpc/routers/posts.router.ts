import { and, desc, eq, lt, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import limax from 'limax'
import { postsTable, userTable } from '#/db/schemas'
import { getStorageObjectUrl } from '#/lib/storage'
import { orpcBase } from '#/orpc'
import { orpcRequireAuthMiddleware } from '#/orpc/middlewares'
import { postPaginationCursorSchema } from '#/schemas/posts.schema'

const generateSlug = (title: string): string => {
  return `${limax(title)}-${nanoid(5)}`
}

const publishedPostSelect = {
  id: postsTable.id,
  slug: postsTable.slug,
  title: postsTable.title,
  coverImageUrl: postsTable.coverImageUrl,
  content: postsTable.content,
  status: postsTable.status,
  viewsCount: postsTable.viewsCount,
  likesCount: postsTable.likesCount,
  commentsCount: postsTable.commentsCount,
  createdAt: postsTable.createdAt,
  updatedAt: postsTable.updatedAt,
  author: {
    id: userTable.id,
    name: userTable.name,
    username: userTable.username,
    image: userTable.image,
  },
}

const createdPostSelect = {
  id: postsTable.id,
  slug: postsTable.slug,
  title: postsTable.title,
  coverImageUrl: postsTable.coverImageUrl,
  content: postsTable.content,
  status: postsTable.status,
  viewsCount: postsTable.viewsCount,
  likesCount: postsTable.likesCount,
  commentsCount: postsTable.commentsCount,
  createdAt: postsTable.createdAt,
  updatedAt: postsTable.updatedAt,
}

const encodeCursor = (input: { createdAt: Date; id: string }) => {
  return Buffer.from(
    JSON.stringify({
      createdAt: input.createdAt.toISOString(),
      id: input.id,
    }),
    'utf8'
  ).toString('base64url')
}

const decodeCursor = (cursor: string) => {
  try {
    const value = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8')
    ) as unknown
    const result = postPaginationCursorSchema.safeParse(value)

    if (!result.success) {
      return null
    }

    return result.data
  } catch {
    return null
  }
}

const resolvePostCoverImageUrl = <T extends { coverImageUrl: string | null }>(
  post: T
): T => {
  return {
    ...post,
    coverImageUrl: getStorageObjectUrl(post.coverImageUrl),
  }
}

const getManyPostsHandler = orpcBase.posts.getMany.handler(
  async ({ context, input, errors }) => {
    const cursor = input.cursor ? decodeCursor(input.cursor) : null

    if (input.cursor && !cursor) {
      throw errors.BAD_REQUEST({
        message: 'Invalid pagination cursor.',
      })
    }

    const paginationFilter = cursor
      ? or(
          lt(postsTable.createdAt, cursor.createdAt),
          and(
            eq(postsTable.createdAt, cursor.createdAt),
            lt(postsTable.id, cursor.id)
          )
        )
      : undefined

    const rows = await context.db
      .select(publishedPostSelect)
      .from(postsTable)
      .innerJoin(userTable, eq(postsTable.authorId, userTable.id))
      .where(
        paginationFilter
          ? and(eq(postsTable.status, 'PUBLISHED'), paginationFilter)
          : eq(postsTable.status, 'PUBLISHED')
      )
      .orderBy(desc(postsTable.createdAt), desc(postsTable.id))
      .limit(input.limit + 1)

    const hasMore = rows.length > input.limit
    const items = (hasMore ? rows.slice(0, input.limit) : rows).map(
      resolvePostCoverImageUrl
    )
    const lastItem = items.at(-1)

    return {
      items,
      nextCursor:
        hasMore && lastItem
          ? encodeCursor({
              createdAt: lastItem.createdAt,
              id: lastItem.id,
            })
          : null,
    }
  }
)

const getOneByUsernameAndSlugHandler =
  orpcBase.posts.getOneByUsernameAndSlug.handler(
    async ({ context, input, errors }) => {
      const postQuery = context.db
        .select(publishedPostSelect)
        .from(postsTable)
        .innerJoin(userTable, eq(postsTable.authorId, userTable.id))
        .where(
          and(
            eq(userTable.username, input.username),
            eq(postsTable.slug, input.slug),
            eq(postsTable.status, 'PUBLISHED')
          )
        )
        .limit(1)

      const [post] = await postQuery

      if (!post) {
        throw errors.NOT_FOUND({
          message: `Post @${input.username}/${input.slug} not found.`,
        })
      }

      return resolvePostCoverImageUrl(post)
    }
  )

const createPostHandler = orpcBase
  .use(orpcRequireAuthMiddleware)
  .posts.create.handler(async ({ context, input, errors }) => {
    const [author] = await context.db
      .select({
        username: userTable.username,
      })
      .from(userTable)
      .where(eq(userTable.id, context.auth.user.id))
      .limit(1)

    if (!author?.username) {
      throw errors.BAD_REQUEST({
        message: 'Author username is required before creating a post.',
      })
    }

    const slug = generateSlug(input.title)

    const [post] = await context.db
      .insert(postsTable)
      .values({
        ...input,
        slug,
        authorId: context.auth.user.id,
      })
      .returning(createdPostSelect)

    if (!post) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: 'Failed to create post.',
      })
    }

    return resolvePostCoverImageUrl(post)
  })

export const postsRouter = {
  getMany: getManyPostsHandler,
  getOneByUsernameAndSlug: getOneByUsernameAndSlugHandler,
  create: createPostHandler,
}
