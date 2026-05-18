import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { userTable } from '#/db/schemas/auth'

export const threadsTable = pgTable(
  'threads',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(),
    points: integer('points').default(0).notNull(),
    commentsCount: integer('comments_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('threads_author_id_idx').on(table.authorId),
    index('threads_created_at_id_idx').on(table.createdAt, table.id),
    index('threads_points_id_idx').on(table.points, table.id),
  ]
)
