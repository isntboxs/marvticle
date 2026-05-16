import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import { threadsInfiniteQueryOptions } from '#/features/threads/hooks/use-threads'
import { DEFAULT_THREADS_LIMIT } from '#/features/threads/schemas/thread.schema'
import { orpc } from '#/orpc/client'

export const useToggleVoteMutation = () => {
  const queryClient = useQueryClient()
  const queryKey = threadsInfiniteQueryOptions({
    limit: DEFAULT_THREADS_LIMIT,
  }).queryKey

  return useMutation(
    orpc.threads.vote.mutationOptions({
      onMutate: async ({ direction, slug }) => {
        await queryClient.cancelQueries({ queryKey })

        const snapshot = queryClient.getQueryData(queryKey)

        queryClient.setQueryData(queryKey, (old) => {
          if (!old) return old

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((thread) => {
                if (thread.slug !== slug) return thread

                const isSameVote = thread.userVote === direction
                const wasOpposite =
                  thread.userVote && thread.userVote !== direction

                return {
                  ...thread,
                  userVote: isSameVote ? null : direction,
                  voteScore:
                    thread.voteScore +
                    (isSameVote
                      ? direction === 'UPVOTE'
                        ? -1
                        : 1 // unvote
                      : wasOpposite
                        ? direction === 'UPVOTE'
                          ? 2
                          : -2 // switch vote
                        : direction === 'UPVOTE'
                          ? 1
                          : -1), // new vote
                }
              }),
            })),
          }
        })

        return { snapshot }
      },
      onError: (error, _input, context) => {
        toast.error('Failed to vote', {
          description: error.message,
        })

        if (context?.snapshot) {
          queryClient.setQueryData(queryKey, context.snapshot)
        }
      },
      onSuccess: () => {
        toast.success('Thread voted', {
          description: 'Your vote has been cast.',
        })
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey })
      },
    })
  )
}
