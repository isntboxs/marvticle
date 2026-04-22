import { orpcBaseContract as base } from '#/orpc/contracts/base.contract'
import {
  createPostBodySchema,
  getManyPostsParamsSchema,
  getOnePostByUsernameAndSlugParamsSchema,
  postSchema,
  postsPageSchema,
} from '#/schemas/posts.schema'

const getManyPostsContract = base
  .route({
    path: '/posts',
    method: 'GET',
    summary: 'Get many posts',
    description:
      'Retrieve published posts with cursor-based pagination ordered by newest first.',
    tags: ['Posts'],
    operationId: 'getManyPosts',
    successStatus: 200,
    successDescription: 'Posts retrieved successfully',
  })
  .input(getManyPostsParamsSchema)
  .output(postsPageSchema)

const getOneByUsernameAndSlugContract = base
  .route({
    path: '/posts/{username}/{slug}',
    method: 'GET',
    summary: 'Get post by username and slug',
    description:
      'Retrieve a single published post by the author username and post slug.',
    tags: ['Posts'],
    operationId: 'getOneByUsernameAndSlug',
    successStatus: 200,
    successDescription: 'Post retrieved successfully',
  })
  .input(getOnePostByUsernameAndSlugParamsSchema)
  .output(postSchema)

const createPostContract = base
  .route({
    path: '/posts',
    method: 'POST',
    summary: 'Create a post',
    description: 'Create a new post.',
    tags: ['Posts'],
    operationId: 'createPost',
    successStatus: 200,
    successDescription: 'Post created successfully',
  })
  .input(createPostBodySchema)
  .output(postSchema.omit({ author: true }))

export const postsContract = {
  getMany: getManyPostsContract,
  getOneByUsernameAndSlug: getOneByUsernameAndSlugContract,
  create: createPostContract,
}
