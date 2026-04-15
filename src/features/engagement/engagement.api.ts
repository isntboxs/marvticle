import {
  commentListSchema,
  countSchema,
  createCommentInputSchema,
  createCommentResultSchema,
  deleteCommentResultSchema,
  toggleLikeInputSchema,
  toggleLikeResultSchema,
  trackViewInputSchema,
  trackViewResultSchema,
  updateCommentInputSchema,
  updateCommentResultSchema,
} from './engagement.schemas'

import { apiFetch } from '#/lib/api/api-client'

type GetCommentsParams = {
  postId: string
  page?: number
  limit?: number
}

export const toggleLike = async (payload: { postId: string }) => {
  toggleLikeInputSchema.parse(payload)

  return apiFetch({
    path: '/api/engagement/likes',
    method: 'POST',
    schema: toggleLikeResultSchema,
    body: payload,
  })
}

export const getLikesCount = async (postId: string, signal?: AbortSignal) =>
  apiFetch({
    path: '/api/engagement/likes/count',
    method: 'GET',
    schema: countSchema,
    query: { postId },
    signal,
  })

export const getComments = async (
  params: GetCommentsParams,
  signal?: AbortSignal
) =>
  apiFetch({
    path: '/api/engagement/comments',
    method: 'GET',
    schema: commentListSchema,
    query: {
      postId: params.postId,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
    signal,
  })

export const createComment = async (payload: {
  postId: string
  content: string
  parentId?: string
}) => {
  createCommentInputSchema.parse(payload)

  return apiFetch({
    path: '/api/engagement/comments',
    method: 'POST',
    schema: createCommentResultSchema,
    body: payload,
  })
}

export const updateComment = async (
  id: string,
  payload: { content: string }
) => {
  updateCommentInputSchema.parse(payload)

  return apiFetch({
    path: `/api/engagement/comments/${id}`,
    method: 'PUT',
    schema: updateCommentResultSchema,
    body: payload,
  })
}

export const deleteComment = async (id: string) =>
  apiFetch({
    path: `/api/engagement/comments/${id}`,
    method: 'DELETE',
    schema: deleteCommentResultSchema,
  })

export const getCommentsCount = async (postId: string, signal?: AbortSignal) =>
  apiFetch({
    path: '/api/engagement/comments/count',
    method: 'GET',
    schema: countSchema,
    query: { postId },
    signal,
  })

export const trackView = async (payload: { postId: string }) => {
  trackViewInputSchema.parse(payload)

  return apiFetch({
    path: '/api/engagement/views',
    method: 'POST',
    schema: trackViewResultSchema,
    body: payload,
  })
}

export const getViewsCount = async (postId: string, signal?: AbortSignal) =>
  apiFetch({
    path: '/api/engagement/views/count',
    method: 'GET',
    schema: countSchema,
    query: { postId },
    signal,
  })
