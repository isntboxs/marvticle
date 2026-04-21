import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { userTable } from './auth'

export const postStatusEnum = pgEnum('post_status', [
  'ARCHIVED',
  'DRAFT',
  'PUBLISHED',
])

export const postsTable = pgTable(
  'posts',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').unique().notNull(),
    coverImageUrl: text('cover_image_url'),
    content: text('content').notNull(),
    status: postStatusEnum('status').default('DRAFT').notNull(),
    viewsCount: integer().notNull().default(0),
    likesCount: integer().notNull().default(0),
    commentsCount: integer().notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    index('posts_slug_idx').on(table.slug),
    index('posts_author_id_idx').on(table.authorId),
    index('posts_status_idx').on(table.status),
  ]
)
