import { relations } from 'drizzle-orm'

import { accountTable, sessionTable, userTable } from '#/db/schemas/auth'
import { commentsTable } from '#/db/schemas/comments'
import { threadsTable } from '#/db/schemas/threads'
import { votesCommentsTable, votesThreadsTable } from '#/db/schemas/votes'

export const userRelations = relations(userTable, ({ many }) => ({
  sessions: many(sessionTable),
  accounts: many(accountTable),
  threads: many(threadsTable),
  comments: many(commentsTable),
  votesThreads: many(votesThreadsTable),
  votesComments: many(votesCommentsTable),
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

export const threadRelations = relations(threadsTable, ({ many, one }) => ({
  author: one(userTable, {
    fields: [threadsTable.authorId],
    references: [userTable.id],
  }),
  comments: many(commentsTable),
  votesThreads: many(votesThreadsTable, {
    relationName: 'thread_votes',
  }),
}))

export const commentRelations = relations(commentsTable, ({ many, one }) => ({
  author: one(userTable, {
    fields: [commentsTable.authorId],
    references: [userTable.id],
  }),
  thread: one(threadsTable, {
    fields: [commentsTable.threadId],
    references: [threadsTable.id],
  }),
  parent: one(commentsTable, {
    fields: [commentsTable.parentId],
    references: [commentsTable.id],
    relationName: 'comment_replies',
  }),
  replies: many(commentsTable, {
    relationName: 'comment_replies',
  }),
  votesComments: many(votesCommentsTable, {
    relationName: 'comment_votes',
  }),
}))

export const voteThreadsRelations = relations(votesThreadsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [votesThreadsTable.userId],
    references: [userTable.id],
  }),
  thread: one(threadsTable, {
    fields: [votesThreadsTable.threadId],
    references: [threadsTable.id],
    relationName: 'thread_votes',
  }),
}))

export const voteCommentsRelations = relations(
  votesCommentsTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [votesCommentsTable.userId],
      references: [userTable.id],
    }),
    comment: one(commentsTable, {
      fields: [votesCommentsTable.commentId],
      references: [commentsTable.id],
      relationName: 'comment_votes',
    }),
  })
)
