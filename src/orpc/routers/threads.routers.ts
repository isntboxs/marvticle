import { and, desc, eq, gt, lt, or, sql } from 'drizzle-orm'
import limax from 'limax'
import { nanoid } from 'nanoid'

import { userTable, votesThreadsTable } from '#/db/schemas'
import { threadsTable } from '#/db/schemas/threads'
import { decodeCursor, encodeCursor } from '#/lib/cursor'
import { orpcBase } from '#/orpc'
import type { ORPCContext } from '#/orpc'
import { authenticated } from '#/orpc/middlewares'
import type { VoteAction, VoteDirectionNullable } from '#/schemas/drizzle-zod'

const generateSlug = (title: string): string => {
  return `${limax(title)}-${nanoid(9)}`
}

const GRAVITY = 1.5
const DISCOVER_WINDOW_DAYS = 30

const trendingScoreExpr = sql<number>`
  ${threadsTable.points}::float /
  POWER(
    EXTRACT(EPOCH FROM (NOW() - ${threadsTable.createdAt})) / 3600.0 + 2,
    ${GRAVITY}
  )
`

const getPeriodSince = (period: string): Date | null => {
  const now = new Date()
  const map: Record<string, Date | null> = {
    week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    all: null,
  }

  return map[period] ?? null
}

const threadSelect = {
  id: threadsTable.id,
  slug: threadsTable.slug,
  title: threadsTable.title,
  content: threadsTable.content,
  points: threadsTable.points,
  commentsCount: threadsTable.commentsCount,
  createdAt: threadsTable.createdAt,
  updatedAt: threadsTable.updatedAt,
}

const authorSelect = {
  id: userTable.id,
  name: userTable.name,
  username: userTable.username,
  image: userTable.image,
  verified: userTable.verified,
}

const viewerThreadVoteCondition = (viewerId: string | undefined) =>
  viewerId
    ? and(
        eq(votesThreadsTable.threadId, threadsTable.id),
        eq(votesThreadsTable.userId, viewerId)
      )
    : sql`false`

const selectThreadBySlug = async (context: ORPCContext, slug: string) => {
  const [thread] = await context.db
    .select({
      ...threadSelect,
      author: authorSelect,
      isVoted: votesThreadsTable.direction,
    })
    .from(threadsTable)
    .innerJoin(userTable, eq(threadsTable.authorId, userTable.id))
    .leftJoin(
      votesThreadsTable,
      viewerThreadVoteCondition(context.auth?.user.id)
    )
    .where(eq(threadsTable.slug, slug))
    .limit(1)

  return thread ?? null
}

const listThreadsHandler = orpcBase.threads.list.handler(
  async ({ context, errors, input }) => {
    const { auth, db } = context
    const { feed, period, sort, limit, cursor } = input

    const isTopSort = sort === 'top'
    const isDiscover = !isTopSort && feed === 'discover'
    const after = cursor ? decodeCursor(cursor) : null

    if (cursor && !after) {
      throw errors.BAD_REQUEST({ message: 'Invalid thread cursor' })
    }

    const conditions = []

    if (isTopSort) {
      const since = getPeriodSince(period)
      if (since) conditions.push(gt(threadsTable.createdAt, since))
    } else if (isDiscover) {
      const windowSince = new Date(
        Date.now() - DISCOVER_WINDOW_DAYS * 24 * 60 * 60 * 1000
      )
      conditions.push(gt(threadsTable.createdAt, windowSince))
    }

    if (after) {
      if (isTopSort) {
        if (after.mode !== 'top') {
          throw errors.BAD_REQUEST({ message: 'Invalid thread cursor' })
        }

        conditions.push(
          or(
            lt(threadsTable.points, after.points),
            and(
              eq(threadsTable.points, after.points),
              lt(threadsTable.id, after.id)
            )
          )
        )
      } else if (isDiscover) {
        if (after.mode !== 'discover') {
          throw errors.BAD_REQUEST({ message: 'Invalid thread cursor' })
        }

        conditions.push(
          or(
            sql`${trendingScoreExpr} < ${after.trendingScore}`,
            and(
              sql`${trendingScoreExpr} = ${after.trendingScore}`,
              lt(threadsTable.id, after.id)
            )
          )
        )
      } else {
        if (after.mode !== 'latest') {
          throw errors.BAD_REQUEST({ message: 'Invalid thread cursor' })
        }

        conditions.push(
          or(
            lt(threadsTable.createdAt, after.createdAt),
            and(
              eq(threadsTable.createdAt, after.createdAt),
              lt(threadsTable.id, after.id)
            )
          )
        )
      }
    }

    const rows = await db
      .select({
        ...threadSelect,
        author: authorSelect,
        isVoted: votesThreadsTable.direction,
        trendingScore: isDiscover
          ? trendingScoreExpr.as('trending_score')
          : sql<number>`0`,
      })
      .from(threadsTable)
      .innerJoin(userTable, eq(threadsTable.authorId, userTable.id))
      .leftJoin(votesThreadsTable, viewerThreadVoteCondition(auth?.user.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        ...(isTopSort
          ? [desc(threadsTable.points), desc(threadsTable.id)]
          : isDiscover
            ? [sql`trending_score DESC`, desc(threadsTable.id)]
            : [desc(threadsTable.createdAt), desc(threadsTable.id)])
      )
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const items = hasMore ? rows.slice(0, limit) : rows
    const lastItem = items.at(-1)

    return {
      items,
      nextCursor:
        hasMore && lastItem
          ? encodeCursor(
              isTopSort
                ? { mode: 'top', id: lastItem.id, points: lastItem.points }
                : isDiscover
                  ? {
                      mode: 'discover',
                      id: lastItem.id,
                      trendingScore: lastItem.trendingScore,
                    }
                  : {
                      mode: 'latest',
                      id: lastItem.id,
                      createdAt: lastItem.createdAt,
                    }
            )
          : null,
    }
  }
)

const getOneThreadHandler = orpcBase.threads.getOne.handler(
  async ({ context, errors, input }) => {
    const thread = await selectThreadBySlug(context, input.slug)

    if (!thread) {
      throw errors.NOT_FOUND({ message: 'Thread not found' })
    }

    return thread
  }
)

const createThreadHandler = orpcBase
  .use(authenticated)
  .threads.create.handler(async ({ context, errors, input }) => {
    const slug = generateSlug(input.title)

    const [newThread] = await context.db
      .insert(threadsTable)
      .values({
        ...input,
        slug,
        authorId: context.auth.user.id,
      })
      .returning({ ...threadSelect })

    if (!newThread) {
      throw errors.INTERNAL_SERVER_ERROR({ message: 'Failed to create thread' })
    }

    return {
      ...newThread,
      author: {
        id: context.auth.user.id,
        name: context.auth.user.name,
        username: context.auth.user.username,
        image: context.auth.user.image ?? null,
        verified: context.auth.user.verified,
      },
      isVoted: null,
    }
  })

const updateThreadHandler = orpcBase
  .use(authenticated)
  .threads.update.handler(async ({ context, errors, input }) => {
    const { db, auth } = context
    const { slug, title, content } = input

    const thread = await selectThreadBySlug(context, slug)

    if (!thread) {
      throw errors.NOT_FOUND({ message: 'Thread not found' })
    }

    if (thread.author.id !== auth.user.id) {
      throw errors.FORBIDDEN({
        message: 'You are not the author of this thread',
      })
    }

    const newSlug = title && title !== thread.title ? generateSlug(title) : slug

    await db
      .update(threadsTable)
      .set({
        slug: newSlug,
        ...(title !== undefined && title !== thread.title && { title }),
        ...(content !== undefined && content !== thread.content && { content }),
        updatedAt: new Date(),
      })
      .where(eq(threadsTable.id, thread.id))

    const updatedThread = await selectThreadBySlug(context, newSlug)

    if (!updatedThread) {
      throw errors.INTERNAL_SERVER_ERROR({ message: 'Failed to update thread' })
    }

    return updatedThread
  })

const deleteThreadHandler = orpcBase
  .use(authenticated)
  .threads.delete.handler(async ({ context, errors, input }) => {
    const { db, auth } = context
    const { slug } = input

    const thread = await selectThreadBySlug(context, slug)

    if (!thread) {
      throw errors.NOT_FOUND({ message: 'Thread not found' })
    }

    if (thread.author.id !== auth.user.id) {
      throw errors.FORBIDDEN({
        message: 'You are not the author of this thread',
      })
    }

    await db.delete(threadsTable).where(eq(threadsTable.id, thread.id))

    return { success: true }
  })

const voteThreadHandler = orpcBase
  .use(authenticated)
  .threads.vote.handler(async ({ context, errors, input }) => {
    const { db, auth } = context
    const { direction, slug } = input

    const vote = await db.transaction(async (tx) => {
      const [thread] = await tx
        .select({
          id: threadsTable.id,
        })
        .from(threadsTable)
        .where(eq(threadsTable.slug, slug))
        .for('update')
        .limit(1)

      if (!thread) {
        throw errors.NOT_FOUND({ message: 'Thread not found' })
      }

      const [existingVote] = await tx
        .select({
          direction: votesThreadsTable.direction,
        })
        .from(votesThreadsTable)
        .where(
          and(
            eq(votesThreadsTable.userId, auth.user.id),
            eq(votesThreadsTable.threadId, thread.id)
          )
        )
        .limit(1)

      let pointDelta: number
      let action: VoteAction
      let resultDirection: VoteDirectionNullable

      if (!existingVote) {
        await tx.insert(votesThreadsTable).values({
          threadId: thread.id,
          userId: auth.user.id,
          direction,
        })

        pointDelta = direction === 'UPVOTE' ? 1 : -1
        action = 'VOTED'
        resultDirection = direction
      } else if (existingVote.direction === direction) {
        await tx
          .delete(votesThreadsTable)
          .where(
            and(
              eq(votesThreadsTable.userId, auth.user.id),
              eq(votesThreadsTable.threadId, thread.id)
            )
          )

        pointDelta = direction === 'UPVOTE' ? -1 : 1
        action = 'UNVOTED'
        resultDirection = null
      } else {
        await tx
          .update(votesThreadsTable)
          .set({
            direction,
          })
          .where(
            and(
              eq(votesThreadsTable.userId, auth.user.id),
              eq(votesThreadsTable.threadId, thread.id)
            )
          )

        pointDelta = direction === 'UPVOTE' ? 2 : -2
        action = 'CHANGED'
        resultDirection = direction
      }

      const [updateThread] = await tx
        .update(threadsTable)
        .set({
          points: sql`${threadsTable.points} + ${pointDelta}`,
        })
        .where(eq(threadsTable.id, thread.id))
        .returning({ points: threadsTable.points })

      if (!updateThread) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: 'Failed to update thread',
        })
      }

      return {
        action,
        points: updateThread.points,
        isVoted: resultDirection,
      }
    })

    return vote
  })

export const threadsRouter = {
  list: listThreadsHandler,
  getOne: getOneThreadHandler,
  create: createThreadHandler,
  update: updateThreadHandler,
  delete: deleteThreadHandler,
  vote: voteThreadHandler,
}
