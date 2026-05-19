import { DEFAULT_COMMENTS_LIMIT } from '#/configs'
import { orpc } from '#/orpc/client'
import type { RouterInputs } from '#/orpc/routers'

type ListCommentsInput = RouterInputs['comments']['list']
type ListCommentRepliesInput = RouterInputs['comments']['listReplies']

export type ThreadCommentsInfiniteQueryOptionsInput = {
  threadSlug: string
  limit?: number
  sortBy?: ListCommentsInput['sortBy']
  includeReplies?: boolean
}

export type CommentRepliesInfiniteQueryOptionsInput = {
  parentId: string
  limit?: number
  sortBy?: ListCommentRepliesInput['sortBy']
  enabled?: boolean
}

export const threadCommentsInfiniteQueryOptions = ({
  threadSlug,
  limit = DEFAULT_COMMENTS_LIMIT,
  sortBy,
  includeReplies,
}: ThreadCommentsInfiniteQueryOptionsInput) =>
  orpc.comments.list.infiniteOptions({
    input: (pageParam: string | null) => ({
      threadSlug,
      limit,
      ...(sortBy ? { sortBy } : {}),
      ...(includeReplies !== undefined ? { includeReplies } : {}),
      ...(typeof pageParam === 'string' ? { cursor: pageParam } : {}),
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export const commentRepliesInfiniteQueryOptions = ({
  parentId,
  limit = DEFAULT_COMMENTS_LIMIT,
  sortBy,
  enabled = true,
}: CommentRepliesInfiniteQueryOptionsInput) =>
  orpc.comments.listReplies.infiniteOptions({
    input: (pageParam: string | null) => ({
      parentId,
      limit,
      ...(sortBy ? { sortBy } : {}),
      ...(typeof pageParam === 'string' ? { cursor: pageParam } : {}),
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  })
