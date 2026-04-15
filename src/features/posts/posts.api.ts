import {
  createPostInputSchema,
  postListSchema,
  postSchema,
} from './posts.schemas'
import type { CreatePostInput } from './posts.schemas'

import { apiFetch } from '#/lib/api/api-client'

type GetPostsParams = {
  limit?: number
  cursor?: string
}

export const getPosts = async (
  params: GetPostsParams = {},
  signal?: AbortSignal
) =>
  apiFetch({
    path: '/api/posts',
    method: 'GET',
    schema: postListSchema,
    query: {
      limit: params.limit ?? 10,
      cursor: params.cursor,
    },
    signal,
  })

export const getPostById = async (id: string, signal?: AbortSignal) =>
  apiFetch({
    path: `/api/posts/${id}`,
    method: 'GET',
    schema: postSchema,
    signal,
  })

export const createPost = async (payload: CreatePostInput) => {
  createPostInputSchema.parse(payload)

  return apiFetch({
    path: '/api/posts',
    method: 'POST',
    schema: postSchema,
    body: payload,
  })
}
