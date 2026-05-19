import { DEFAULT_THREADS_LIMIT } from '#/configs'
import { orpc } from '#/orpc/client'
import type { RouterInputs } from '#/orpc/routers'

type ListThreadsInput = RouterInputs['threads']['list']

export type ThreadsListInfiniteQueryOptionsInput = {
  feed?: ListThreadsInput['feed']
  sort?: ListThreadsInput['sort']
  period?: ListThreadsInput['period']
  limit?: number
}

export const threadsListInfiniteQueryOptions = ({
  feed,
  sort,
  period,
  limit = DEFAULT_THREADS_LIMIT,
}: ThreadsListInfiniteQueryOptionsInput = {}) =>
  orpc.threads.list.infiniteOptions({
    input: (pageParam: string | null) => ({
      ...(feed ? { feed } : {}),
      ...(sort ? { sort } : {}),
      ...(period ? { period } : {}),
      limit,
      ...(typeof pageParam === 'string' ? { cursor: pageParam } : {}),
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export const threadDetailQueryOptions = ({ slug }: { slug: string }) =>
  orpc.threads.getOne.queryOptions({ input: { slug } })
