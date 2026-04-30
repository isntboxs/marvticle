import { sql } from 'drizzle-orm'
import {
  check,
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
    slug: text('slug').notNull(),
    coverImage: text('cover_image'),
    content: text('content').notNull(),
    status: postStatusEnum('status').notNull().default('PUBLISHED'),
    viewsCount: integer('views_count').notNull().default(0),
    likesCount: integer('likes_count').notNull().default(0),
    commentsCount: integer('comments_count').notNull().default(0),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check('posts_views_count_non_negative', sql`${table.viewsCount} >= 0`),
    check('posts_likes_count_non_negative', sql`${table.likesCount} >= 0`),
    check(
      'posts_comments_count_non_negative',
      sql`${table.commentsCount} >= 0`
    ),
    check(
      'posts_published_at_matches_status',
      sql`(${table.status} = 'PUBLISHED' AND ${table.publishedAt} IS NOT NULL) OR (${table.status} <> 'PUBLISHED' AND ${table.publishedAt} IS NULL)`
    ),
    uniqueIndex('posts_slug_idx').on(table.slug),
    index('posts_author_id_idx').on(table.authorId),
    index('posts_feed_idx').on(
      table.status,
      table.publishedAt.desc(),
      table.id.desc()
    ),
  ]
)
