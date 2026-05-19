import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query'

import { toast } from 'sonner'

import {
  commentRepliesInfiniteQueryOptions,
  threadCommentsInfiniteQueryOptions,
} from '#/features/comments/query-options'
import { threadDetailQueryOptions } from '#/features/threads/query-options'
import { orpc } from '#/orpc/client'

export {
  commentRepliesInfiniteQueryOptions,
  threadCommentsInfiniteQueryOptions,
}

const threadCommentsKey = (threadSlug: string) =>
  orpc.comments.list.key({ type: 'infinite', input: { threadSlug } })

const commentRepliesKey = (parentId: string) =>
  orpc.comments.listReplies.key({ type: 'infinite', input: { parentId } })

const invalidateThreadCommentQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  threadSlug: string
) => {
  void queryClient.invalidateQueries({
    queryKey: threadCommentsKey(threadSlug),
  })
  void queryClient.invalidateQueries({
    queryKey: threadDetailQueryOptions({ slug: threadSlug }).queryKey,
  })
}

export const useThreadCommentsInfiniteQuery = ({
  threadSlug,
}: {
  threadSlug: string
}) => {
  const query = useSuspenseInfiniteQuery(
    threadCommentsInfiniteQueryOptions({ threadSlug })
  )
  const comments = query.data.pages.flatMap((page) => page.items)
  const totalCount = query.data.pages.at(-1)?.totalCount ?? 0

  return {
    ...query,
    comments,
    totalCount,
  }
}

export const useCommentRepliesInfiniteQuery = ({
  parentId,
  enabled = true,
}: {
  parentId: string
  enabled?: boolean
}) => {
  const query = useInfiniteQuery(
    commentRepliesInfiniteQueryOptions({ parentId, enabled })
  )
  const replies = query.data?.pages.flatMap((page) => page.items) ?? []
  const totalCount = query.data?.pages.at(-1)?.totalCount ?? 0

  return {
    ...query,
    replies,
    totalCount,
  }
}

export const useCreateCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.comments.create.mutationOptions({
      onSuccess: (_comment, variables) => {
        toast.success('Comment created', {
          description: 'Your comment has been posted.',
        })

        invalidateThreadCommentQueries(queryClient, variables.threadSlug)
      },

      onError: (error) => {
        toast.error('Failed to create comment', {
          description: error.message,
        })
      },
    })
  )
}

export const useCreateReplyMutation = ({
  threadSlug,
}: {
  threadSlug: string
}) => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.comments.reply.mutationOptions({
      onSuccess: (_reply, variables) => {
        toast.success('Reply created', {
          description: 'Your reply has been posted.',
        })

        invalidateThreadCommentQueries(queryClient, threadSlug)
        void queryClient.invalidateQueries({
          queryKey: commentRepliesKey(variables.parentId),
        })
      },

      onError: (error) => {
        toast.error('Failed to reply', {
          description: error.message,
        })
      },
    })
  )
}

export const useUpdateCommentMutation = ({
  threadSlug,
}: {
  threadSlug: string
}) => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.comments.update.mutationOptions({
      onSuccess: () => {
        toast.success('Comment updated', {
          description: 'Your comment has been updated.',
        })

        invalidateThreadCommentQueries(queryClient, threadSlug)
        void queryClient.invalidateQueries({
          queryKey: orpc.comments.listReplies.key({ type: 'infinite' }),
        })
      },

      onError: (error) => {
        toast.error('Failed to update comment', {
          description: error.message,
        })
      },
    })
  )
}

export const useDeleteCommentMutation = ({
  threadSlug,
}: {
  threadSlug: string
}) => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.comments.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Comment deleted', {
          description: 'Your comment has been deleted.',
        })

        invalidateThreadCommentQueries(queryClient, threadSlug)
        void queryClient.invalidateQueries({
          queryKey: orpc.comments.listReplies.key({ type: 'infinite' }),
        })
      },

      onError: (error) => {
        toast.error('Failed to delete comment', {
          description: error.message,
        })
      },
    })
  )
}
