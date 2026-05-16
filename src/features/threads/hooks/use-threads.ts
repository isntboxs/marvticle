import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'

import { DEFAULT_THREADS_LIMIT } from '#/features/threads/schemas/thread.schema'
import { orpc } from '#/orpc/client'

export const threadsInfiniteQueryOptions = ({ limit }: { limit: number }) =>
  orpc.threads.getMany.infiniteOptions({
    input: (pageParam: string | null) => ({
      limit,
      cursor: typeof pageParam === 'string' ? pageParam : undefined,
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export const useThreadsInfiniteQuery = ({ limit }: { limit: number }) => {
  const query = useSuspenseInfiniteQuery(threadsInfiniteQueryOptions({ limit }))

  const threads = query.data.pages.flatMap((page) => page.items)

  return { ...query, threads }
}

const threadDetailQueryOptions = ({ slug }: { slug: string }) =>
  orpc.threads.getOne.queryOptions({ input: { slug } })

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
          queryKey: threadsInfiniteQueryOptions({
            limit: DEFAULT_THREADS_LIMIT,
          }).queryKey,
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
