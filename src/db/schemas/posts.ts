import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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
    status: postStatusEnum('status').notNull().default('DRAFT'),
    viewsCount: integer('views_count').notNull().default(0),
    likesCount: integer('likes_count').notNull().default(0),
    commentsCount: integer('comments_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('posts_slug_idx').on(table.slug),
    index('posts_author_id_idx').on(table.authorId),
    index('posts_status_idx').on(table.status),
  ]
)
