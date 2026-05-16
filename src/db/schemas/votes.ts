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
import { threadsTable } from '#/db/schemas/threads'

export const voteDirectionEnum = pgEnum('vote_direction', [
  'UPVOTE',
  'DOWNVOTE',
])

export type VoteDirectionType = InferEnum<typeof voteDirectionEnum>

export const votesTable = pgTable(
  'votes',
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
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.threadId],
      name: 'pk_votes_user_id_thread_id',
    }),
    index('idx_votes_thread_id').on(table.threadId),
  ]
)
