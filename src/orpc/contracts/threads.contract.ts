import {
  deleteThreadInputSchema,
  deleteThreadOutputSchema,
  getOneThreadInputSchema,
  listThreadsInputSchema,
  threadInsertSchema,
  threadOutputSchema,
  threadsOutputSchema,
  threadUpdateInputSchema,
} from '#/features/threads/schemas/thread.schema'
import {
  voteThreadInputSchema,
  voteThreadOutputSchema,
} from '#/features/votes/schemas/votes.schema'
import { orpcBaseContract as base } from '#/orpc/contracts/base.contract'

const listThreadsContract = base
  .route({
    path: '/threads',
    method: 'GET',
    summary: 'List threads',
    description: 'List threads',
    tags: ['Threads'],
    operationId: 'listThreads',
    successStatus: 200,
    successDescription: 'Threads retrieved successfully',
  })
  .input(listThreadsInputSchema)
  .output(threadsOutputSchema)

const getOneThreadContract = base
  .route({
    path: '/threads/{slug}',
    method: 'GET',
    summary: 'Get one thread',
    description: 'Get one thread',
    tags: ['Threads'],
    operationId: 'getOneThread',
    successStatus: 200,
    successDescription: 'Thread retrieved successfully',
  })
  .input(getOneThreadInputSchema)
  .output(threadOutputSchema)

const createThreadContract = base
  .route({
    path: '/threads',
    method: 'POST',
    summary: 'Create thread',
    description: 'Create a new thread',
    tags: ['Threads'],
    operationId: 'createThread',
    successStatus: 200,
    successDescription: 'Thread created successfully',
  })
  .input(threadInsertSchema)
  .output(threadOutputSchema)

const voteThreadContract = base
  .route({
    path: '/threads/{slug}/vote',
    method: 'POST',
    summary: 'Vote thread',
    description: 'Vote thread',
    tags: ['Votes'],
    operationId: 'voteThread',
    successStatus: 200,
    successDescription: 'Vote thread successfully',
  })
  .input(voteThreadInputSchema)
  .output(voteThreadOutputSchema)

const updateThreadContract = base
  .route({
    path: '/threads/{slug}',
    method: 'PATCH',
    summary: 'Update thread',
    description: 'Update thread',
    tags: ['Threads'],
    operationId: 'updateThread',
    successStatus: 200,
    successDescription: 'Thread updated successfully',
  })
  .input(threadUpdateInputSchema)
  .output(threadOutputSchema)

const deleteThreadContract = base
  .route({
    path: '/threads/{slug}',
    method: 'DELETE',
    summary: 'Delete thread',
    description: 'Delete thread',
    tags: ['Threads'],
    operationId: 'deleteThread',
    successStatus: 200,
    successDescription: 'Thread deleted successfully',
  })
  .input(deleteThreadInputSchema)
  .output(deleteThreadOutputSchema)

export const threadsContract = {
  list: listThreadsContract,
  getOne: getOneThreadContract,
  create: createThreadContract,
  update: updateThreadContract,
  delete: deleteThreadContract,
  vote: voteThreadContract,
}
