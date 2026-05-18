import limax from 'limax'
import { nanoid } from 'nanoid'

import { threadsTable } from '#/db/schemas/threads'
import { orpcBase } from '#/orpc'
import { authenticated } from '#/orpc/middlewares'

const generateSlug = (title: string): string => {
  return `${limax(title)}-${nanoid(9)}`
}

// const encodeCursor = (cursor: ThreadPaginationCursor): string => {
//   return Buffer.from(JSON.stringify(cursor), 'utf-8').toString('base64url')
// }

// const decodeCursor = (cursor: string): ThreadPaginationCursor | null => {
//   try {
//     const value = JSON.parse(
//       Buffer.from(cursor, 'base64url').toString('utf-8')
//     ) as unknown

//     const result = threadPaginationCursorSchema.safeParse(value)

//     if (!result.success) return null

//     return result.data
//   } catch {
//     return null
//   }
// }

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

// const authorSelect = {
//   id: userTable.id,
//   name: userTable.name,
//   username: userTable.username,
//   image: userTable.image,
//   verified: userTable.verified,
// }

// const getManyThreadHandler = orpcBase.threads.getMany.handler(
//   async ({ context, errors, input }) => {
//     const cursor = input.cursor ? decodeCursor(input.cursor) : null

//     if (input.cursor && !cursor) {
//       throw errors.BAD_REQUEST({ message: 'Invalid thread cursor' })
//     }

//     const threads = await context.db
//       .select({
//         ...threadSelect,
//         author: authorSelect,
//         voteScore: sql<number>`
//       count(case when ${votesTable.direction} = 'UPVOTE' then 1 end) -
//       count(case when ${votesTable.direction} = 'DOWNVOTE' then 1 end)
//     `.as('vote_score'),
//         userVote: sql<ToggleVoteOutput['userVote']>`
//       max(case when ${votesTable.userId} = ${context.auth?.user.id ?? null}
//       then ${votesTable.direction} end)
//     `.as('user_vote'),
//       })
//       .from(threadsTable)
//       .innerJoin(userTable, eq(threadsTable.authorId, userTable.id))
//       .leftJoin(votesTable, eq(votesTable.threadId, threadsTable.id))
//       .groupBy(threadsTable.id, userTable.id)
//       .where(
//         cursor
//           ? or(
//               lt(threadsTable.createdAt, cursor.createdAt),
//               and(
//                 eq(threadsTable.createdAt, cursor.createdAt),
//                 lt(threadsTable.id, cursor.id)
//               )
//             )
//           : undefined
//       )
//       .orderBy(desc(threadsTable.createdAt), desc(threadsTable.id))
//       .limit(input.limit + 1)

//     let nextCursor: string | null = null
//     const hasMore = threads.length > input.limit
//     const items = hasMore ? threads.slice(0, input.limit) : threads
//     const lastItem = items.at(-1)

//     if (hasMore && lastItem) {
//       nextCursor = encodeCursor({
//         id: lastItem.id,
//         createdAt: lastItem.createdAt,
//       })
//     }

//     return {
//       items,
//       nextCursor,
//     }
//   }
// )

// const getOneThreadBySlugHandler = orpcBase.threads.getOne.handler(
//   async ({ context, errors, input }) => {
//     const [thread] = await context.db
//       .select({
//         ...threadSelect,
//         author: authorSelect,
//         voteScore: sql<number>`
//       count(case when ${votesTable.direction} = 'UPVOTE' then 1 end) -
//       count(case when ${votesTable.direction} = 'DOWNVOTE' then 1 end)
//     `.as('vote_score'),
//         userVote: sql<ToggleVoteOutput['userVote']>`
//       max(case when ${votesTable.userId} = ${context.auth?.user.id ?? null}
//       then ${votesTable.direction} end)
//     `.as('user_vote'),
//       })
//       .from(threadsTable)
//       .innerJoin(userTable, eq(threadsTable.authorId, userTable.id))
//       .leftJoin(votesTable, eq(votesTable.threadId, threadsTable.id))
//       .groupBy(threadsTable.id, userTable.id)
//       .where(eq(threadsTable.slug, input.slug))

//     if (!thread) {
//       throw errors.NOT_FOUND({ message: 'Thread not found' })
//     }

//     return thread
//   }
// )

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
        image: context.auth.user.image,
        verified: context.auth.user.verified,
      },
      isVoted: null,
    }
  })

// const toggleVoteHandler = orpcBase
//   .use(orpcRequireAuthMiddleware)
//   .threads.vote.handler(async ({ context, errors, input }) => {
//     const [existingThread] = await context.db
//       .select({
//         id: threadsTable.id,
//       })
//       .from(threadsTable)
//       .where(eq(threadsTable.slug, input.slug))

//     if (!existingThread) {
//       throw errors.NOT_FOUND({ message: 'Thread not found' })
//     }

//     const vote = await db.transaction(async (tx) => {
//       const [existingVote] = await tx
//         .select()
//         .from(votesTable)
//         .where(
//           and(
//             eq(votesTable.userId, context.auth.user.id),
//             eq(votesTable.threadId, existingThread.id)
//           )
//         )
//         .limit(1)

//       const currentVote = existingVote

//       if (!currentVote) {
//         await tx.insert(votesTable).values({
//           userId: context.auth.user.id,
//           threadId: existingThread.id,
//           direction: input.direction,
//         })

//         return {
//           action: 'VOTED',
//           userVote: input.direction,
//         }
//       } else if (currentVote.direction === input.direction) {
//         await tx
//           .delete(votesTable)
//           .where(
//             and(
//               eq(votesTable.userId, context.auth.user.id),
//               eq(votesTable.threadId, existingThread.id)
//             )
//           )

//         return {
//           action: 'UNVOTED',
//           userVote: null,
//         }
//       } else {
//         await tx
//           .update(votesTable)
//           .set({
//             direction: input.direction,
//           })
//           .where(
//             and(
//               eq(votesTable.userId, context.auth.user.id),
//               eq(votesTable.threadId, existingThread.id)
//             )
//           )

//         return {
//           action: 'CHANGED',
//           userVote: input.direction,
//         }
//       }
//     })

//     const [countVotes] = await context.db
//       .select({
//         voteScore: sql<number>`
//       count(case when ${votesTable.direction} = 'UPVOTE' then 1 end) -
//       count(case when ${votesTable.direction} = 'DOWNVOTE' then 1 end)
//     `.as('vote_score'),
//       })
//       .from(votesTable)
//       .where(eq(votesTable.threadId, existingThread.id))

//     if (!countVotes) {
//       throw errors.INTERNAL_SERVER_ERROR({
//         message: 'Failed to get total votes',
//       })
//     }

//     return {
//       action: vote.action,
//       userVote: vote.userVote,
//       voteScore: countVotes.voteScore,
//     } as ToggleVoteOutput
//   })

export const threadsRouter = {
  // getMany: getManyThreadHandler,
  // getOne: getOneThreadBySlugHandler,
  create: createThreadHandler,
  // vote: toggleVoteHandler,
}
