import { ORPCError } from '@orpc/client'
import { and, asc, desc, eq, isNull, lt, or, sql } from 'drizzle-orm'

import { threadsTable, votesCommentsTable } from '#/db/schemas'
import { userTable } from '#/db/schemas/auth'
import { commentsTable } from '#/db/schemas/comments'
import type { ListCommentsOutput } from '#/features/comments/schemas/comment.schema'
import { decodeCursor, encodeCursor } from '#/lib/cursor'
import { orpcBase } from '#/orpc'
import type { ORPCContext } from '#/orpc'
import { authenticated } from '#/orpc/middlewares'
import type {
  SortByComments,
  VoteDirectionNullable,
} from '#/schemas/drizzle-zod'

// const DELETED_COMMENT_CONTENT = '[deleted]'

const commentSelect = {
  id: commentsTable.id,
  threadId: commentsTable.threadId,
  authorId: commentsTable.authorId,
  parentId: commentsTable.parentId,
  content: commentsTable.content,
  depth: commentsTable.depth,
  points: commentsTable.points,
  commentsCount: commentsTable.commentsCount,
  createdAt: commentsTable.createdAt,
  updatedAt: commentsTable.updatedAt,
  deletedAt: commentsTable.deletedAt,
}

const authorSelect = {
  id: userTable.id,
  name: userTable.name,
  username: userTable.username,
  image: userTable.image,
}

const queryComments = async ({
  context,
  threadId,
  parentId,
  sortBy,
  cursor,
  limit,
}: {
  context: ORPCContext
  threadId?: string
  parentId?: string
  sortBy: SortByComments
  cursor?: string
  limit: number
}) => {
  const after = cursor ? decodeCursor(cursor) : null

  if (cursor && !after) {
    throw new ORPCError('BAD_REQUEST', { message: 'Invalid cursor' })
  }

  const conditions = []

  // scope: top-level atau children
  if (threadId) {
    conditions.push(eq(commentsTable.threadId, threadId))
    conditions.push(isNull(commentsTable.parentId))
  } else if (parentId) {
    conditions.push(eq(commentsTable.parentId, parentId))
  }

  // exclude soft deleted dari listing (tapi tetap include di tree buat context)
  // kalau mau include deleted, hapus baris ini
  // conditions.push(isNull(commentsTable.deletedAt))

  // cursor condition
  if (after) {
    if (sortBy === 'top' && 'points' in after) {
      conditions.push(
        or(
          lt(commentsTable.points, after.points),
          and(
            eq(commentsTable.points, after.points),
            lt(commentsTable.id, after.id)
          )
        )
      )
    } else if ('createdAt' in after) {
      const dir = sortBy === 'oldest' ? 'asc' : 'desc'
      conditions.push(
        or(
          dir === 'asc'
            ? lt(commentsTable.createdAt, new Date(after.createdAt)) // oldest: ambil yang lebih baru
            : lt(commentsTable.createdAt, new Date(after.createdAt)),
          and(
            eq(commentsTable.createdAt, new Date(after.createdAt)),
            lt(commentsTable.id, after.id)
          )
        )
      )
    }
  }

  const orderBy =
    sortBy === 'top'
      ? [desc(commentsTable.points), desc(commentsTable.id)]
      : sortBy === 'oldest'
        ? [asc(commentsTable.createdAt), asc(commentsTable.id)]
        : [desc(commentsTable.createdAt), desc(commentsTable.id)]

  const rows = await context.db
    .select({
      ...commentSelect,
      author: authorSelect,
      isVoted: sql<VoteDirectionNullable>`
          max(case when ${votesCommentsTable.userId} = ${context.auth?.user.id ?? null}
          then ${votesCommentsTable.direction} end)
        `.as('is_voted'),
    })
    .from(commentsTable)
    .innerJoin(userTable, eq(commentsTable.authorId, userTable.id))
    .leftJoin(
      votesCommentsTable,
      eq(votesCommentsTable.commentId, commentsTable.id)
    )
    .groupBy(commentsTable.id, userTable.id)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(limit + 1)

  return rows
}

const listCommentsThreadHandler = orpcBase.comments.list.handler(
  async ({ context, errors, input }) => {
    const { db } = context
    const { threadSlug, includeReplies, limit, cursor, sortBy } = input

    const [thread] = await db
      .select({ id: threadsTable.id })
      .from(threadsTable)
      .where(eq(threadsTable.slug, threadSlug))
      .limit(1)

    if (!thread) {
      throw errors.NOT_FOUND({ message: 'Thread not found' })
    }

    const rows = await queryComments({
      context,
      threadId: thread.id,
      sortBy,
      cursor,
      limit,
    })

    let nextCursor: string | null = null
    const hasMore = rows.length > limit
    const rawItems = hasMore ? rows.slice(0, limit) : rows
    const lastItem = rawItems.at(-1)

    if (hasMore && lastItem) {
      nextCursor = encodeCursor(
        sortBy === 'top'
          ? { mode: 'top', id: lastItem.id, points: lastItem.points }
          : { mode: 'latest', id: lastItem.id, createdAt: lastItem.createdAt }
      )
    }

    const repliesMap: Record<string, ListCommentsOutput> = {}
    if (includeReplies && rawItems.length > 0) {
      await Promise.all(
        rawItems.map(async (comment) => {
          const replies = await queryComments({
            context,
            parentId: comment.id,
            sortBy,
            cursor,
            limit: 2,
          })

          let nextCursorReplies: string | null = null
          const hasMoreReplies = replies.length > 2
          const rawReplies = hasMoreReplies ? replies.slice(0, 2) : replies
          const lastReply = rawReplies.at(-1)

          if (hasMoreReplies && lastReply) {
            nextCursorReplies = encodeCursor(
              sortBy === 'top'
                ? { mode: 'top', id: lastReply.id, points: lastReply.points }
                : {
                    mode: 'latest',
                    id: lastReply.id,
                    createdAt: lastReply.createdAt,
                  }
            )
          }

          repliesMap[comment.id] = {
            items: rawReplies.map((r) => ({
              ...r,
              isDeleted: r.deletedAt !== null,
            })),
            nextCursor: nextCursorReplies,
          }
        })
      )
    }

    const items = rawItems.map((comment) => ({
      ...comment,
      isDeleted: comment.deletedAt !== null,
      childComments: repliesMap[comment.id]?.items ?? [],
      nextCursor: repliesMap[comment.id]?.nextCursor ?? null,
    }))

    return {
      items,
      nextCursor,
    }
  }
)

const listCommentRepliesHandler = orpcBase.comments.listReplies.handler(
  async ({ context, errors, input }) => {
    const { db } = context
    const { parentId, limit, cursor, sortBy } = input

    const [parentComment] = await db
      .select({ id: commentsTable.id, threadId: commentsTable.threadId })
      .from(commentsTable)
      .where(eq(commentsTable.id, parentId))
      .limit(1)

    if (!parentComment) {
      throw errors.NOT_FOUND({ message: 'Parent comment not found' })
    }

    const comments = await queryComments({
      context,
      parentId: parentComment.id,
      sortBy,
      cursor,
      limit,
    })

    let nextCursor: string | null = null
    const hasMore = comments.length > limit
    const rawItems = hasMore ? comments.slice(0, limit) : comments
    const lastItem = rawItems.at(-1)

    if (hasMore && lastItem) {
      nextCursor = encodeCursor(
        sortBy === 'top'
          ? { mode: 'top', id: lastItem.id, points: lastItem.points }
          : { mode: 'latest', id: lastItem.id, createdAt: lastItem.createdAt }
      )
    }

    const items = rawItems.map((comment) => ({
      ...comment,
      isDeleted: comment.deletedAt !== null,
      childComments: [],
    }))

    return {
      items,
      nextCursor,
    }
  }
)

const createCommentThreadHandler = orpcBase
  .use(authenticated)
  .comments.create.handler(async ({ context, errors, input }) => {
    const { auth, db } = context
    const { content, threadSlug } = input

    const result = await db.transaction(async (tx) => {
      const thread = await tx.query.threadsTable.findFirst({
        where: eq(threadsTable.slug, threadSlug),
        columns: { id: true },
      })

      if (!thread) {
        throw errors.NOT_FOUND({ message: 'Thread not found' })
      }

      const [newComment] = await tx
        .insert(commentsTable)
        .values({
          threadId: thread.id,
          content,
          authorId: auth.user.id,
        })
        .returning({ ...commentSelect })

      if (!newComment) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: 'Failed to create comment',
        })
      }

      await tx
        .update(threadsTable)
        .set({
          commentsCount: sql`${threadsTable.commentsCount} + 1`,
        })
        .where(eq(threadsTable.id, thread.id))

      return newComment
    })

    return {
      ...result,
      isDeleted: result.deletedAt !== null,
      author: {
        id: auth.user.id,
        name: auth.user.name,
        username: auth.user.username,
        image: auth.user.image,
        verified: auth.user.verified,
      },
      isVoted: null,
    }
  })

const replyCommentThreadHandler = orpcBase
  .use(authenticated)
  .comments.reply.handler(async ({ context, errors, input }) => {
    const { auth, db } = context
    const { content, parentId } = input

    const result = await db.transaction(async (tx) => {
      const parentComment = await tx.query.commentsTable.findFirst({
        where: eq(commentsTable.id, parentId),
        columns: { id: true, threadId: true, depth: true, deletedAt: true },
      })

      if (!parentComment) {
        throw errors.NOT_FOUND({ message: 'Comment not found' })
      }

      const thread = await tx.query.threadsTable.findFirst({
        where: eq(threadsTable.id, parentComment.threadId),
        columns: { id: true },
      })

      if (!thread) {
        throw errors.NOT_FOUND({ message: 'Thread not found' })
      }

      if (parentComment.threadId !== thread.id) {
        throw errors.BAD_REQUEST({
          message: 'Parent comment belongs to a different thread',
        })
      }

      if (parentComment.deletedAt) {
        throw errors.BAD_REQUEST({
          message: 'Cannot reply to a deleted comment',
        })
      }

      const [newComment] = await tx
        .insert(commentsTable)
        .values({
          threadId: thread.id,
          parentId,
          content,
          depth: parentComment.depth + 1,
          authorId: auth.user.id,
        })
        .returning({ id: commentsTable.id })

      if (!newComment) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: 'Failed to create comment',
        })
      }

      const [updatedParentComment] = await tx
        .update(commentsTable)
        .set({
          commentsCount: sql`${commentsTable.commentsCount} + 1`,
        })
        .where(eq(commentsTable.id, parentComment.id))
        .returning({ commentsCount: commentsTable.commentsCount })

      if (!updatedParentComment) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: 'Failed to update parent comment',
        })
      }

      const [updatedThread] = await tx
        .update(threadsTable)
        .set({
          commentsCount: sql`${threadsTable.commentsCount} + 1`,
        })
        .where(eq(threadsTable.id, thread.id))
        .returning({ commentsCount: threadsTable.commentsCount })

      if (!updatedThread) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: 'Failed to update thread',
        })
      }

      const [comment] = await tx
        .select({
          ...commentSelect,
          author: authorSelect,
          isVoted: sql<VoteDirectionNullable>`
            max(case when ${votesCommentsTable.userId} = ${auth.user.id}
            then ${votesCommentsTable.direction} end)
          `.as('is_voted'),
        })
        .from(commentsTable)
        .innerJoin(userTable, eq(commentsTable.authorId, userTable.id))
        .leftJoin(
          votesCommentsTable,
          eq(votesCommentsTable.commentId, commentsTable.id)
        )
        .groupBy(commentsTable.id, userTable.id)
        .where(eq(commentsTable.id, newComment.id))
        .limit(1)

      if (!comment) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: 'Failed to load created comment',
        })
      }

      return {
        ...comment,
        isDeleted: comment.deletedAt !== null,
      }
    })

    return result
  })

// const updateCommentHandler = orpcBase
//   .use(orpcRequireAuthMiddleware)
//   .comments.update.handler(async ({ context, errors, input }) => {
//     const currentComment = await getCommentById({ context, id: input.id })

//     if (!currentComment) {
//       throw errors.NOT_FOUND({ message: 'Comment not found' })
//     }

//     if (currentComment.authorId !== context.auth.user.id) {
//       throw errors.FORBIDDEN({
//         message: 'You can only update your own comments',
//       })
//     }

//     if (currentComment.deletedAt) {
//       throw errors.CONFLICT({
//         message: 'Cannot update a deleted comment',
//       })
//     }

//     await context.db
//       .update(commentsTable)
//       .set({ content: input.content })
//       .where(eq(commentsTable.id, input.id))

//     const updatedComment = await getCommentById({ context, id: input.id })

//     if (!updatedComment) {
//       throw errors.INTERNAL_SERVER_ERROR({
//         message: 'Failed to load updated comment',
//       })
//     }

//     return updatedComment
//   })

// const deleteCommentHandler = orpcBase
//   .use(orpcRequireAuthMiddleware)
//   .comments.delete.handler(async ({ context, errors, input }) => {
//     const currentComment = await getCommentById({ context, id: input.id })

//     if (!currentComment) {
//       throw errors.NOT_FOUND({ message: 'Comment not found' })
//     }

//     if (currentComment.authorId !== context.auth.user.id) {
//       throw errors.FORBIDDEN({
//         message: 'You can only delete your own comments',
//       })
//     }

//     await context.db
//       .update(commentsTable)
//       .set({
//         content: DELETED_COMMENT_CONTENT,
//         deletedAt: new Date(),
//       })
//       .where(eq(commentsTable.id, input.id))

//     const deletedComment = await getCommentById({ context, id: input.id })

//     if (!deletedComment) {
//       throw errors.INTERNAL_SERVER_ERROR({
//         message: 'Failed to load deleted comment',
//       })
//     }

//     return deletedComment
//   })

export const commentsRouter = {
  list: listCommentsThreadHandler,
  listReplies: listCommentRepliesHandler,
  create: createCommentThreadHandler,
  reply: replyCommentThreadHandler,
  // update: updateCommentHandler,
  // delete: deleteCommentHandler,
}
