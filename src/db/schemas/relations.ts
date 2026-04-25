import { relations } from 'drizzle-orm'

import { accountTable, sessionTable, userTable } from '#/db/schemas/auth'
import { postsTable } from '#/db/schemas/posts'

export const userRelations = relations(userTable, ({ many }) => ({
  sessions: many(sessionTable),
  accounts: many(accountTable),
  posts: many(postsTable),
}))

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}))

export const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}))

export const postRelations = relations(postsTable, ({ one }) => ({
  author: one(userTable, {
    fields: [postsTable.authorId],
    references: [userTable.id],
  }),
}))
