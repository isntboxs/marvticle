import { ORPCError } from '@orpc/client'
import { and, asc, desc, eq, gt, isNull, lt, or, sql } from 'drizzle-orm'

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
  VoteAction,
  VoteDirectionNullable,
} from '#/schemas/drizzle-zod'

const DELETED_COMMENT_CONTENT = '[deleted]'

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

const viewerCommentVoteCondition = (viewerId: string | undefined) =>
  viewerId
    ? and(
        eq(votesCommentsTable.commentId, commentsTable.id),
        eq(votesCommentsTable.userId, viewerId)
      )
    : sql`false`

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

  if (threadId) {
    conditions.push(eq(commentsTable.threadId, threadId))
    conditions.push(isNull(commentsTable.parentId))
  } else if (parentId) {
    conditions.push(eq(commentsTable.parentId, parentId))
  }

  if (after) {
    if (sortBy === 'top') {
      if (after.mode !== 'top') {
        throw new ORPCError('BAD_REQUEST', { message: 'Invalid cursor' })
      }

      conditions.push(
        or(
          lt(commentsTable.points, after.points),
          and(
            eq(commentsTable.points, after.points),
            lt(commentsTable.id, after.id)
          )
        )
      )
    } else if (sortBy === 'oldest') {
      if (after.mode !== 'oldest') {
        throw new ORPCError('BAD_REQUEST', { message: 'Invalid cursor' })
      }

      conditions.push(
        or(
          gt(commentsTable.createdAt, after.createdAt),
          and(
            eq(commentsTable.createdAt, after.createdAt),
            gt(commentsTable.id, after.id)
          )
        )
      )
    } else {
      if (after.mode !== 'latest') {
        throw new ORPCError('BAD_REQUEST', { message: 'Invalid cursor' })
      }

      conditions.push(
        or(
          lt(commentsTable.createdAt, after.createdAt),
          and(
            eq(commentsTable.createdAt, after.createdAt),
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
      isVoted: votesCommentsTable.direction,
    })
    .from(commentsTable)
    .innerJoin(userTable, eq(commentsTable.authorId, userTable.id))
    .leftJoin(
      votesCommentsTable,
      viewerCommentVoteCondition(context.auth?.user.id)
    )
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(limit + 1)

  return rows
}

const mapToCommentList = (
  rows: Awaited<ReturnType<typeof queryComments>>,
  repliesMap: Record<string, ListCommentsOutput>
) => {
  return rows.map((comment) => ({
    ...comment,
    isDeleted: comment.deletedAt !== null,
    childComments: repliesMap[comment.id]?.items ?? [],
  }))
}

const buildCommentsListResponse = (
  rows: Awaited<ReturnType<typeof queryComments>>,
  limit: number,
  sortBy: SortByComments,
  repliesMap: Record<string, ListCommentsOutput>,
  totalCount: number
): ListCommentsOutput => {
  let nextCursor: string | null = null
  const hasMore = rows.length > limit
  const rawItems = hasMore ? rows.slice(0, limit) : rows
  const lastItem = rawItems.at(-1)

  if (hasMore && lastItem) {
    nextCursor = encodeCursor(
      sortBy === 'top'
        ? { mode: 'top', id: lastItem.id, points: lastItem.points }
        : {
            mode: sortBy === 'oldest' ? 'oldest' : 'latest',
            id: lastItem.id,
            createdAt: lastItem.createdAt,
          }
    )
  }

  return {
    items: mapToCommentList(rawItems, repliesMap),
    nextCursor,
    totalCount,
  }
}

const listCommentsThreadHandler = orpcBase.comments.list.handler(
  async ({ context, errors, input }) => {
    const { db } = context
    const { threadSlug, includeReplies, limit, cursor, sortBy } = input

    const [thread] = await db
      .select({
        id: threadsTable.id,
        commentsCount: threadsTable.commentsCount,
      })
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

    const repliesMap: Record<string, ListCommentsOutput> = {}

    if (includeReplies && rows.length > 0) {
      const rawItems = rows.length > limit ? rows.slice(0, limit) : rows

      await Promise.all(
        rawItems.map(async (comment) => {
          const replies = await queryComments({
            context,
            parentId: comment.id,
            sortBy,
            limit: 2,
          })

          repliesMap[comment.id] = buildCommentsListResponse(
            replies,
            2,
            sortBy,
            {},
            comment.commentsCount
          )
        })
      )
    }

    return buildCommentsListResponse(
      rows,
      limit,
      sortBy,
      repliesMap,
      thread.commentsCount
    )
  }
)

const listCommentRepliesHandler = orpcBase.comments.listReplies.handler(
  async ({ context, errors, input }) => {
    const { db } = context
    const { parentId, limit, cursor, sortBy } = input

    const [parentComment] = await db
      .select({
        id: commentsTable.id,
        threadId: commentsTable.threadId,
        commentsCount: commentsTable.commentsCount,
      })
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

    return buildCommentsListResponse(
      comments,
      limit,
      sortBy,
      {},
      parentComment.commentsCount
    )
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
        image: auth.user.image ?? null,
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
          isVoted: votesCommentsTable.direction,
        })
        .from(commentsTable)
        .innerJoin(userTable, eq(commentsTable.authorId, userTable.id))
        .leftJoin(votesCommentsTable, viewerCommentVoteCondition(auth.user.id))
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

const commentUpdateThreadHandler = orpcBase
  .use(authenticated)
  .comments.update.handler(async ({ context, errors, input }) => {
    const { auth, db } = context
    const { id, content } = input

    const currentComment = await db.query.commentsTable.findFirst({
      where: eq(commentsTable.id, id),
      columns: { id: true, authorId: true, deletedAt: true },
    })

    if (!currentComment) {
      throw errors.NOT_FOUND({ message: 'Comment not found' })
    }

    if (currentComment.authorId !== auth.user.id) {
      throw errors.FORBIDDEN({
        message: 'You can only update your own comments',
      })
    }

    if (currentComment.deletedAt) {
      throw errors.CONFLICT({
        message: 'Cannot update a deleted comment',
      })
    }

    await db
      .update(commentsTable)
      .set({ content })
      .where(eq(commentsTable.id, id))

    const [updatedComment] = await db
      .select({
        ...commentSelect,
        author: authorSelect,
        isVoted: votesCommentsTable.direction,
      })
      .from(commentsTable)
      .innerJoin(userTable, eq(commentsTable.authorId, userTable.id))
      .leftJoin(votesCommentsTable, viewerCommentVoteCondition(auth.user.id))
      .where(eq(commentsTable.id, id))
      .limit(1)

    if (!updatedComment) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: 'Failed to load updated comment',
      })
    }

    return {
      ...updatedComment,
      isDeleted: updatedComment.deletedAt !== null,
    }
  })

const commentDeleteHandler = orpcBase
  .use(authenticated)
  .comments.delete.handler(async ({ context, errors, input }) => {
    const { auth, db } = context
    const { id } = input

    const currentComment = await db.query.commentsTable.findFirst({
      where: eq(commentsTable.id, id),
      columns: { authorId: true },
    })

    if (!currentComment) {
      throw errors.NOT_FOUND({ message: 'Comment not found' })
    }

    if (currentComment.authorId !== auth.user.id) {
      throw errors.FORBIDDEN({
        message: 'You can only delete your own comments',
      })
    }

    await context.db
      .update(commentsTable)
      .set({
        content: DELETED_COMMENT_CONTENT,
        deletedAt: new Date(),
      })
      .where(eq(commentsTable.id, input.id))

    const [updatedComment] = await db
      .select({
        ...commentSelect,
        author: authorSelect,
        isVoted: votesCommentsTable.direction,
      })
      .from(commentsTable)
      .innerJoin(userTable, eq(commentsTable.authorId, userTable.id))
      .leftJoin(votesCommentsTable, viewerCommentVoteCondition(auth.user.id))
      .where(eq(commentsTable.id, input.id))
      .limit(1)

    if (!updatedComment) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: 'Failed to load updated comment',
      })
    }

    return {
      ...updatedComment,
      isDeleted: updatedComment.deletedAt !== null,
    }
  })

const voteCommentThreadHandler = orpcBase
  .use(authenticated)
  .comments.vote.handler(async ({ context, errors, input }) => {
    const { db, auth } = context
    const { direction, id } = input

    const vote = await db.transaction(async (tx) => {
      const [comment] = await tx
        .select({
          id: commentsTable.id,
          deletedAt: commentsTable.deletedAt,
        })
        .from(commentsTable)
        .where(eq(commentsTable.id, id))
        .for('update')
        .limit(1)

      if (!comment) {
        throw errors.NOT_FOUND({ message: 'Comment not found' })
      }

      if (comment.deletedAt) {
        throw errors.CONFLICT({
          message: 'Cannot vote on a deleted comment',
        })
      }

      const [existingVote] = await tx
        .select({
          direction: votesCommentsTable.direction,
        })
        .from(votesCommentsTable)
        .where(
          and(
            eq(votesCommentsTable.userId, auth.user.id),
            eq(votesCommentsTable.commentId, comment.id)
          )
        )
        .limit(1)

      let pointDelta: number
      let action: VoteAction
      let resultDirection: VoteDirectionNullable

      if (!existingVote) {
        await tx.insert(votesCommentsTable).values({
          commentId: comment.id,
          userId: auth.user.id,
          direction,
        })

        pointDelta = direction === 'UPVOTE' ? 1 : -1
        action = 'VOTED'
        resultDirection = direction
      } else if (existingVote.direction === direction) {
        await tx
          .delete(votesCommentsTable)
          .where(
            and(
              eq(votesCommentsTable.userId, auth.user.id),
              eq(votesCommentsTable.commentId, comment.id)
            )
          )

        pointDelta = direction === 'UPVOTE' ? -1 : 1
        action = 'UNVOTED'
        resultDirection = null
      } else {
        await tx
          .update(votesCommentsTable)
          .set({
            direction,
          })
          .where(
            and(
              eq(votesCommentsTable.userId, auth.user.id),
              eq(votesCommentsTable.commentId, comment.id)
            )
          )

        pointDelta = direction === 'UPVOTE' ? 2 : -2
        action = 'CHANGED'
        resultDirection = direction
      }

      const [updateComment] = await tx
        .update(commentsTable)
        .set({
          points: sql`${commentsTable.points} + ${pointDelta}`,
        })
        .where(eq(commentsTable.id, comment.id))
        .returning({ points: commentsTable.points })

      if (!updateComment) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: 'Failed to update comment',
        })
      }

      return {
        action,
        points: updateComment.points,
        isVoted: resultDirection,
      }
    })

    return vote
  })

export const commentsRouter = {
  list: listCommentsThreadHandler,
  listReplies: listCommentRepliesHandler,
  create: createCommentThreadHandler,
  reply: replyCommentThreadHandler,
  update: commentUpdateThreadHandler,
  delete: commentDeleteHandler,
  vote: voteCommentThreadHandler,
}
