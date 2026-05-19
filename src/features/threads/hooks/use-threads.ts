import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'

import {
  threadDetailQueryOptions,
  threadsListInfiniteQueryOptions,
} from '#/features/threads/query-options'
import { orpc } from '#/orpc/client'

export { threadDetailQueryOptions, threadsListInfiniteQueryOptions }
export const threadsInfiniteQueryOptions = threadsListInfiniteQueryOptions

export const useThreadsInfiniteQuery = ({ limit }: { limit: number }) => {
  const query = useSuspenseInfiniteQuery(
    threadsListInfiniteQueryOptions({ limit })
  )

  const threads = query.data.pages.flatMap((page) => page.items)

  return { ...query, threads }
}

export const useThreadDetailQuery = ({ slug }: { slug: string }) =>
  useSuspenseQuery(threadDetailQueryOptions({ slug }))

export const useCreateThreadMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.threads.create.mutationOptions({
      onSuccess: () => {
        toast.success('Thread created', {
          description: 'Your thread has been published.',
        })

        void queryClient.invalidateQueries({
          queryKey: orpc.threads.list.key({ type: 'infinite' }),
        })

        void navigate({
          to: '.',
          viewTransition: true,
        })
      },

      onError: (error) => {
        toast.error('Failed to create thread', {
          description: error.message,
        })
      },
    })
  )
}

export const useUpdateThreadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.threads.update.mutationOptions({
      onSuccess: (thread, variables) => {
        toast.success('Thread updated', {
          description: 'Your thread has been updated.',
        })

        void queryClient.invalidateQueries({
          queryKey: orpc.threads.list.key({ type: 'infinite' }),
        })

        queryClient.setQueryData(
          threadDetailQueryOptions({ slug: thread.slug }).queryKey,
          thread
        )

        if (thread.slug !== variables.slug) {
          queryClient.removeQueries({
            queryKey: threadDetailQueryOptions({ slug: variables.slug })
              .queryKey,
            exact: true,
          })
        }
      },

      onError: (error) => {
        toast.error('Failed to update thread', {
          description: error.message,
        })
      },
    })
  )
}

export const useDeleteThreadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.threads.delete.mutationOptions({
      onSuccess: (_result, variables) => {
        toast.success('Thread deleted', {
          description: 'Your thread has been deleted.',
        })

        void queryClient.invalidateQueries({
          queryKey: orpc.threads.list.key({ type: 'infinite' }),
        })
        queryClient.removeQueries({
          queryKey: threadDetailQueryOptions({ slug: variables.slug }).queryKey,
          exact: true,
        })
      },

      onError: (error) => {
        toast.error('Failed to delete thread', {
          description: error.message,
        })
      },
    })
  )
}
