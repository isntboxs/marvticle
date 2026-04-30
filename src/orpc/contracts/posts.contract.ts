import { orpcBaseContract as base } from '#/orpc/contracts/base.contract'
import {
  createPostBodySchema,
  getManyPostsParamsSchema,
  getOnePostByUsernameAndSlugParamsSchema,
  postSchema,
  postsPageSchema,
  updatePostInputSchema,
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
      'Retrieve a single post by the author username and post slug. Published posts are publicly accessible. Draft and archived posts are only accessible to the post owner.',
    tags: ['Posts'],
    operationId: 'getOneByUsernameAndSlug',
    successStatus: 200,
    successDescription: 'Post retrieved successfully',
  })
  .input(getOnePostByUsernameAndSlugParamsSchema)
  .output(postSchema)

const getEditableByUsernameAndSlugContract = base
  .route({
    path: '/posts/{username}/{slug}/edit',
    method: 'GET',
    summary: 'Get editable post by username and slug',
    description:
      'Retrieve a post owned by the authenticated author for editing.',
    tags: ['Posts'],
    operationId: 'getEditablePostByUsernameAndSlug',
    successStatus: 200,
    successDescription: 'Editable post retrieved successfully',
  })
  .input(getOnePostByUsernameAndSlugParamsSchema)
  .output(postSchema.omit({ author: true }))

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

const updatePostContract = base
  .route({
    path: '/posts/{id}',
    method: 'PATCH',
    summary: 'Update a post',
    description: 'Update an existing post owned by the authenticated author.',
    tags: ['Posts'],
    operationId: 'updatePost',
    successStatus: 200,
    successDescription: 'Post updated successfully',
  })
  .input(updatePostInputSchema)
  .output(postSchema.omit({ author: true }))

export const postsContract = {
  getMany: getManyPostsContract,
  getOneByUsernameAndSlug: getOneByUsernameAndSlugContract,
  getEditableByUsernameAndSlug: getEditableByUsernameAndSlugContract,
  create: createPostContract,
  update: updatePostContract,
}
