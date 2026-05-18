import {
  commentOutputSchema,
  createCommentThreadInputSchema,
  listCommentRepliesInputSchema,
  listCommentsOutputSchema,
  listCommentsThreadInputSchema,
  replyToCommentThreadInputSchema,
} from '#/features/comments/schemas/comment.schema'
import { orpcBaseContract as base } from '#/orpc/contracts/base.contract'

const listCommentsByThreadContract = base
  .route({
    path: '/threads/{threadSlug}/comments',
    method: 'GET',
    summary: 'List thread comments',
    description: 'List comments for a thread.',
    tags: ['Comments'],
    operationId: 'listCommentsThread',
    successStatus: 200,
    successDescription: 'Thread comments listed successfully',
  })
  .input(listCommentsThreadInputSchema)
  .output(listCommentsOutputSchema)

const listCommentRepliesContract = base
  .route({
    path: '/comments/{parentId}/replies',
    method: 'GET',
    summary: 'List comment replies',
    description: 'List replies for a comment.',
    tags: ['Comments'],
    operationId: 'listCommentReplies',
    successStatus: 200,
    successDescription: 'Comment replies listed successfully',
  })
  .input(listCommentRepliesInputSchema)
  .output(listCommentsOutputSchema)

const createCommentThreadContract = base
  .route({
    path: '/threads/{threadSlug}/comments',
    method: 'POST',
    summary: 'Create comment',
    description: 'Create a comment on a thread.',
    tags: ['Comments'],
    operationId: 'createCommentThread',
    successStatus: 200,
    successDescription: 'Comment created successfully',
  })
  .input(createCommentThreadInputSchema)
  .output(commentOutputSchema)

const replyCommentThreadContract = base
  .route({
    path: '/comments/{parentId}/replies',
    method: 'POST',
    summary: 'Reply to comment',
    description: 'Reply to an existing comment on a thread.',
    tags: ['Comments'],
    operationId: 'replyCommentThread',
    successStatus: 200,
    successDescription: 'Comment replied successfully',
  })
  .input(replyToCommentThreadInputSchema)
  .output(commentOutputSchema)

// const updateCommentContract = base
//   .route({
//     path: '/comments/{id}',
//     method: 'PATCH',
//     summary: 'Update comment',
//     description: 'Update an existing comment owned by the current user.',
//     tags: ['Comments'],
//     operationId: 'updateComment',
//     successStatus: 200,
//     successDescription: 'Comment updated successfully',
//   })
//   .input(commentUpdateSchema)
//   .output(commentSelectSchema)

// const deleteCommentContract = base
//   .route({
//     path: '/comments/{id}',
//     method: 'DELETE',
//     summary: 'Delete comment',
//     description: 'Soft delete an existing comment owned by the current user.',
//     tags: ['Comments'],
//     operationId: 'deleteComment',
//     successStatus: 200,
//     successDescription: 'Comment deleted successfully',
//   })
//   .input(commentDeleteSchema)
//   .output(commentSelectSchema)

export const commentsContract = {
  list: listCommentsByThreadContract,
  listReplies: listCommentRepliesContract,
  create: createCommentThreadContract,
  reply: replyCommentThreadContract,
  // update: updateCommentContract,
  // delete: deleteCommentContract,
}
