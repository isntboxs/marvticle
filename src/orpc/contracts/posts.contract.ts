import { orpcBaseContract as base } from '#/orpc/contracts/base.contract'
import {
  createPostBodySchema,
  getManyPostsParamsSchema,
  getOnePostSlugParamsSchema,
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

const getOnePostSlugContract = base
  .route({
    path: '/posts/{slug}',
    method: 'GET',
    summary: 'Get post by slug',
    description: 'Retrieve a single published post by its slug.',
    tags: ['Posts'],
    operationId: 'getOnePostSlug',
    successStatus: 200,
    successDescription: 'Post retrieved successfully',
  })
  .input(getOnePostSlugParamsSchema)
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
  getOnePostSlug: getOnePostSlugContract,
  create: createPostContract,
}
