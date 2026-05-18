import {
  threadInsertSchema,
  threadOutputSchema,
} from '#/features/threads/schemas/thread.schema'
import { orpcBaseContract as base } from '#/orpc/contracts/base.contract'

// const getManyThreadsContract = base
//   .route({
//     path: '/threads',
//     method: 'GET',
//     summary: 'Get many threads',
//     description: 'Get many threads',
//     tags: ['Threads'],
//     operationId: 'getManyThreads',
//     successStatus: 200,
//     successDescription: 'Threads retrieved successfully',
//   })
//   .input(getManyThreadsParamsSchema)
//   .output(threadsSchema)

// const getOneThreadBySlugContract = base
//   .route({
//     path: '/threads/{slug}',
//     method: 'GET',
//     summary: 'Get one thread by slug',
//     description: 'Get one thread by slug',
//     tags: ['Threads'],
//     operationId: 'getOneThreadBySlug',
//     successStatus: 200,
//     successDescription: 'Thread retrieved successfully',
//   })
//   .input(getOneThreadBySlugSchema)
//   .output(threadOutputSchema)

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

// const toggleVoteContract = base
//   .route({
//     path: '/threads/{slug}/vote',
//     method: 'POST',
//     summary: 'Toggle vote',
//     description: 'Toggle vote',
//     tags: ['Threads'],
//     operationId: 'toggleVote',
//     successStatus: 200,
//     successDescription: 'Vote toggled successfully',
//   })
//   .input(toggleVoteInputSchema)
//   .output(toggleVoteOutputSchema)

export const threadsContract = {
  // getMany: getManyThreadsContract,
  // getOne: getOneThreadBySlugContract,
  create: createThreadContract,
  // vote: toggleVoteContract,
}
