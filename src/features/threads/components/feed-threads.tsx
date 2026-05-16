import { Fragment } from 'react/jsx-runtime'

import { Separator } from '#/components/ui/separator'
import { ThreadCard } from '#/features/threads/components/thread-card'
import { useThreadsInfiniteQuery } from '#/features/threads/hooks/use-threads'
import { DEFAULT_THREADS_LIMIT } from '#/features/threads/schemas/thread.schema'

export const FeedThreads = () => {
  const { threads } = useThreadsInfiniteQuery({ limit: DEFAULT_THREADS_LIMIT })

  return (
    <div className="grid grid-cols-1 gap-4">
      {threads.map((thread) => {
        return (
          <Fragment key={thread.id}>
            <ThreadCard {...thread} />

            <Separator />
          </Fragment>
        )
      })}
    </div>
  )
}
