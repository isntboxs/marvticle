import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query'

import type { VoteDirectionType } from '#/db/schemas'
import { commentRepliesInfiniteQueryOptions } from '#/features/comments/query-options'
import { threadDetailQueryOptions } from '#/features/threads/query-options'
import { orpc } from '#/orpc/client'
import type { RouterOutputs } from '#/orpc/routers'
import type { VoteDirectionNullable } from '#/schemas/drizzle-zod'

type VoteState = {
  points: number
  isVoted: VoteDirectionNullable
}

type ThreadItem = RouterOutputs['threads']['list']['items'][number]
type ThreadDetail = RouterOutputs['threads']['getOne']
type ThreadsListOutput = RouterOutputs['threads']['list']
type ThreadsInfiniteData = InfiniteData<ThreadsListOutput, string | null>
type CommentItem = RouterOutputs['comments']['list']['items'][number]
type CommentsListOutput = RouterOutputs['comments']['list']
type CommentsInfiniteData = InfiniteData<CommentsListOutput, string | null>

export type ThreadVoteSnapshot = {
  lists: Array<[QueryKey, ThreadsInfiniteData | undefined]>
  detail: [QueryKey, ThreadDetail | undefined]
}

export type CommentVoteSnapshot = {
  lists: Array<[QueryKey, CommentsInfiniteData | undefined]>
  replies: Array<[QueryKey, CommentsInfiniteData | undefined]>
}

export const getOptimisticVoteState = (
  current: VoteState,
  direction: VoteDirectionType
): VoteState => {
  const isSameVote = current.isVoted === direction
  const wasOpposite = current.isVoted !== null && current.isVoted !== direction

  const pointDelta = isSameVote
    ? direction === 'UPVOTE'
      ? -1
      : 1
    : wasOpposite
      ? direction === 'UPVOTE'
        ? 2
        : -2
      : direction === 'UPVOTE'
        ? 1
        : -1

  return {
    points: current.points + pointDelta,
    isVoted: isSameVote ? null : direction,
  }
}

const threadsListKey = () => orpc.threads.list.key({ type: 'infinite' })
const commentListKey = () => orpc.comments.list.key({ type: 'infinite' })
const commentRepliesListKey = () =>
  orpc.comments.listReplies.key({ type: 'infinite' })

export const snapshotThreadVoteQueries = (
  queryClient: QueryClient,
  slug: string
): ThreadVoteSnapshot => {
  const detailQueryKey = threadDetailQueryOptions({ slug }).queryKey

  return {
    lists: queryClient.getQueriesData<ThreadsInfiniteData>({
      queryKey: threadsListKey(),
    }),
    detail: [
      detailQueryKey,
      queryClient.getQueryData<ThreadDetail>(detailQueryKey),
    ],
  }
}

export const restoreThreadVoteSnapshot = (
  queryClient: QueryClient,
  snapshot: ThreadVoteSnapshot
) => {
  for (const [queryKey, data] of snapshot.lists) {
    queryClient.setQueryData(queryKey, data)
  }

  queryClient.setQueryData(snapshot.detail[0], snapshot.detail[1])
}

export const updateThreadVoteCaches = (
  queryClient: QueryClient,
  slug: string,
  updater: (thread: ThreadItem) => ThreadItem
) => {
  queryClient.setQueriesData<ThreadsInfiniteData>(
    { queryKey: threadsListKey() },
    (old) => {
      if (!old) return old

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((thread) =>
            thread.slug === slug ? updater(thread) : thread
          ),
        })),
      }
    }
  )
}

export const updateThreadDetailVoteCache = (
  queryClient: QueryClient,
  slug: string,
  updater: (thread: ThreadDetail) => ThreadDetail
) => {
  queryClient.setQueryData<ThreadDetail>(
    threadDetailQueryOptions({ slug }).queryKey,
    (old) => (old ? updater(old) : old)
  )
}

export const applyOptimisticThreadVote = (
  queryClient: QueryClient,
  slug: string,
  direction: VoteDirectionType
) => {
  const update = <TThread extends VoteState>(thread: TThread): TThread => ({
    ...thread,
    ...getOptimisticVoteState(thread, direction),
  })

  updateThreadVoteCaches(queryClient, slug, update)
  updateThreadDetailVoteCache(queryClient, slug, update)
}

export const applyThreadVoteResult = (
  queryClient: QueryClient,
  slug: string,
  result: RouterOutputs['threads']['vote']
) => {
  const update = <TThread extends VoteState>(thread: TThread): TThread => ({
    ...thread,
    points: result.points,
    isVoted: result.isVoted,
  })

  updateThreadVoteCaches(queryClient, slug, update)
  updateThreadDetailVoteCache(queryClient, slug, update)
}

const updateCommentItems = (
  comments: Array<CommentItem>,
  id: string,
  updater: (comment: CommentItem) => CommentItem
): Array<CommentItem> =>
  comments.map((comment) => {
    const updatedComment = comment.id === id ? updater(comment) : comment

    if (!updatedComment.childComments?.length) {
      return updatedComment
    }

    return {
      ...updatedComment,
      childComments: updateCommentItems(
        updatedComment.childComments,
        id,
        updater
      ),
    }
  })

const updateCommentVoteCaches = (
  queryClient: QueryClient,
  queryKey: QueryKey,
  id: string,
  updater: (comment: CommentItem) => CommentItem
) => {
  queryClient.setQueriesData<CommentsInfiniteData>({ queryKey }, (old) => {
    if (!old) return old

    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: updateCommentItems(page.items, id, updater),
      })),
    }
  })
}

export const snapshotCommentVoteQueries = (
  queryClient: QueryClient
): CommentVoteSnapshot => ({
  lists: queryClient.getQueriesData<CommentsInfiniteData>({
    queryKey: commentListKey(),
  }),
  replies: queryClient.getQueriesData<CommentsInfiniteData>({
    queryKey: commentRepliesListKey(),
  }),
})

export const restoreCommentVoteSnapshot = (
  queryClient: QueryClient,
  snapshot: CommentVoteSnapshot
) => {
  for (const [queryKey, data] of snapshot.lists) {
    queryClient.setQueryData(queryKey, data)
  }

  for (const [queryKey, data] of snapshot.replies) {
    queryClient.setQueryData(queryKey, data)
  }
}

export const applyOptimisticCommentVote = (
  queryClient: QueryClient,
  id: string,
  direction: VoteDirectionType
) => {
  const update = (comment: CommentItem): CommentItem => ({
    ...comment,
    ...getOptimisticVoteState(comment, direction),
  })

  updateCommentVoteCaches(queryClient, commentListKey(), id, update)
  updateCommentVoteCaches(queryClient, commentRepliesListKey(), id, update)
}

export const applyCommentVoteResult = (
  queryClient: QueryClient,
  id: string,
  result: RouterOutputs['comments']['vote']
) => {
  const update = (comment: CommentItem): CommentItem => ({
    ...comment,
    points: result.points,
    isVoted: result.isVoted,
  })

  updateCommentVoteCaches(queryClient, commentListKey(), id, update)
  updateCommentVoteCaches(queryClient, commentRepliesListKey(), id, update)
}

export const invalidateThreadVoteQueries = (
  queryClient: QueryClient,
  slug: string
) => {
  void queryClient.invalidateQueries({ queryKey: threadsListKey() })
  void queryClient.invalidateQueries({
    queryKey: threadDetailQueryOptions({ slug }).queryKey,
  })
}

export const invalidateCommentVoteQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({ queryKey: commentListKey() })
  void queryClient.invalidateQueries({ queryKey: commentRepliesListKey() })
}

export const cancelThreadVoteQueries = async (
  queryClient: QueryClient,
  slug: string
) => {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: threadsListKey() }),
    queryClient.cancelQueries({
      queryKey: threadDetailQueryOptions({ slug }).queryKey,
    }),
  ])
}

export const cancelCommentVoteQueries = async (
  queryClient: QueryClient,
  id: string
) => {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: commentListKey() }),
    queryClient.cancelQueries({ queryKey: commentRepliesListKey() }),
    queryClient.cancelQueries({
      queryKey: commentRepliesInfiniteQueryOptions({ parentId: id }).queryKey,
    }),
  ])
}
