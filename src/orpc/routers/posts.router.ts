import { and, desc, eq, lt, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import limax from 'limax'
import { postsTable, userTable } from '#/db/schemas'
import { orpcBase } from '#/orpc'
import { orpcRequireAuthMiddleware } from '#/orpc/middlewares'
import { postPaginationCursorSchema } from '#/schemas/posts.schema'

type UpdatePostValues = Partial<
  Pick<
    typeof postsTable.$inferInsert,
    'title' | 'coverImage' | 'content' | 'status'
  >
>

const generateSlug = (title: string): string => {
  return `${limax(title)}-${nanoid(5)}`
}

const publishedPostSelect = {
  id: postsTable.id,
  slug: postsTable.slug,
  title: postsTable.title,
  coverImage: postsTable.coverImage,
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
  coverImage: postsTable.coverImage,
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
    const items = hasMore ? rows.slice(0, input.limit) : rows
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

      return post
    }
  )

const getEditableByUsernameAndSlugHandler = orpcBase
  .use(orpcRequireAuthMiddleware)
  .posts.getEditableByUsernameAndSlug.handler(
    async ({ context, input, errors }) => {
      const [row] = await context.db
        .select(createdPostSelect)
        .from(postsTable)
        .innerJoin(userTable, eq(postsTable.authorId, userTable.id))
        .where(
          and(
            eq(userTable.id, context.auth.user.id),
            eq(userTable.username, input.username),
            eq(postsTable.slug, input.slug)
          )
        )
        .limit(1)

      if (!row) {
        throw errors.NOT_FOUND({
          message: `Post @${input.username}/${input.slug} not found.`,
        })
      }

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        coverImage: row.coverImage,
        content: row.content,
        status: row.status,
        viewsCount: row.viewsCount,
        likesCount: row.likesCount,
        commentsCount: row.commentsCount,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }
    }
  )

const createPostHandler = orpcBase
  .use(orpcRequireAuthMiddleware)
  .posts.create.handler(async ({ context, input, errors }) => {
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

    return post
  })

const updatePostHandler = orpcBase
  .use(orpcRequireAuthMiddleware)
  .posts.update.handler(async ({ context, input, errors }) => {
    const [existingPost] = await context.db
      .select({
        authorId: postsTable.authorId,
      })
      .from(postsTable)
      .where(eq(postsTable.id, input.id))
      .limit(1)

    if (!existingPost) {
      throw errors.NOT_FOUND({
        message: 'Post not found.',
      })
    }

    if (existingPost.authorId !== context.auth.user.id) {
      throw errors.FORBIDDEN({
        message: 'You can only update your own posts.',
      })
    }

    const updateValues: UpdatePostValues = {}

    if (input.title !== undefined) {
      updateValues.title = input.title
    }

    if (input.coverImage !== undefined) {
      updateValues.coverImage = input.coverImage || null
    }

    if (input.content !== undefined) {
      updateValues.content = input.content
    }

    if (input.status !== undefined) {
      updateValues.status = input.status
    }

    const [post] = await context.db
      .update(postsTable)
      .set(updateValues)
      .where(eq(postsTable.id, input.id))
      .returning(createdPostSelect)

    if (!post) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: 'Failed to update post.',
      })
    }

    return post
  })

export const postsRouter = {
  getMany: getManyPostsHandler,
  getOneByUsernameAndSlug: getOneByUsernameAndSlugHandler,
  getEditableByUsernameAndSlug: getEditableByUsernameAndSlugHandler,
  create: createPostHandler,
  update: updatePostHandler,
}
