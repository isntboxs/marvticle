import type { InferEnum } from 'drizzle-orm'
import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { userTable } from '#/db/schemas/auth'
import { commentsTable } from '#/db/schemas/comments'
import { threadsTable } from '#/db/schemas/threads'

export const voteDirectionEnum = pgEnum('vote_direction', [
  'UPVOTE',
  'DOWNVOTE',
])

export type VoteDirectionType = InferEnum<typeof voteDirectionEnum>

export const votesThreadsTable = pgTable(
  'votes_threads',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    threadId: uuid('thread_id')
      .notNull()
      .references(() => threadsTable.id, { onDelete: 'cascade' }),
    direction: voteDirectionEnum().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.threadId],
      name: 'pk_votes_threads_user_id_thread_id',
    }),
    index('idx_votes_threads_thread_id').on(table.threadId),
  ]
)

export const votesCommentsTable = pgTable(
  'votes_comments',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => commentsTable.id, { onDelete: 'cascade' }),
    direction: voteDirectionEnum().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.commentId],
      name: 'pk_votes_comments_user_id_comment_id',
    }),
    index('idx_votes_comments_comment_id').on(table.commentId),
  ]
)
