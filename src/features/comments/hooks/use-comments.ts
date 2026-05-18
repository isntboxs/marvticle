import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query'

import { toast } from 'sonner'

import { orpc } from '#/orpc/client'

export const threadCommentsInfiniteQueryOptions = ({
  threadSlug,
  limit,
}: {
  threadSlug: string
  limit?: number
}) =>
  orpc.comments.getByThread.infiniteOptions({
    input: (pageParam: string | null) => ({
      limit,
      threadSlug,
      cursor: typeof pageParam === 'string' ? pageParam : undefined,
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export const commentRepliesInfiniteQueryOptions = ({
  parentId,
  limit,
  enabled = true,
}: {
  parentId: string
  limit?: number
  enabled?: boolean
}) =>
  orpc.comments.getReplies.infiniteOptions({
    input: (pageParam: string | null) => ({
      limit,
      parentId,
      cursor: typeof pageParam === 'string' ? pageParam : undefined,
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  })

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
  const query = useSuspenseInfiniteQuery(
    commentRepliesInfiniteQueryOptions({ parentId, enabled })
  )
  const replies = query.data.pages.flatMap((page) => page.items)
  const totalCount = query.data.pages.at(-1)?.totalCount ?? 0

  return {
    ...query,
    replies,
    totalCount,
  }
}

export const useCreateCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.comments.createRoot.mutationOptions({
      onSuccess: (_comment, variables) => {
        toast.success('Comment created', {
          description: 'Your comment has been posted.',
        })

        void queryClient.invalidateQueries({
          queryKey: threadCommentsInfiniteQueryOptions({
            threadSlug: variables.threadSlug,
          }).queryKey,
        })
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
    orpc.comments.createReply.mutationOptions({
      onSuccess: (_reply, variables) => {
        toast.success('Reply created', {
          description: 'Your reply has been posted.',
        })

        void queryClient.invalidateQueries({
          queryKey: threadCommentsInfiniteQueryOptions({
            threadSlug,
          }).queryKey,
        })

        void queryClient.invalidateQueries({
          queryKey: commentRepliesInfiniteQueryOptions({
            parentId: variables.parentId,
          }).queryKey,
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

        void queryClient.invalidateQueries({
          queryKey: threadCommentsInfiniteQueryOptions({
            threadSlug,
          }).queryKey,
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

        void queryClient.invalidateQueries({
          queryKey: threadCommentsInfiniteQueryOptions({
            threadSlug,
          }).queryKey,
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
