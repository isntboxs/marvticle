import { createFileRoute } from '@tanstack/react-router'

import { MarkdownRenderer } from '#/components/markdown-renderer'
import { Separator } from '#/components/ui/separator'
import { CommentsThread } from '#/features/comments/components/comments-thread'
import {
  threadDetailQueryOptions,
  useThreadDetailQuery,
} from '#/features/threads/hooks/use-threads'

export const Route = createFileRoute('/_main/$username_/threads/$threadSlug')({
  beforeLoad: async ({ context, params }) => {
    const thread = await context.queryClient.ensureQueryData(
      threadDetailQueryOptions({ slug: params.threadSlug })
    )

    return { thread }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { threadSlug } = Route.useParams()
  const { data: thread } = useThreadDetailQuery({ slug: threadSlug })

  return (
    <div className="container mx-auto w-full max-w-2xl px-4 pt-4 pb-8">
      <MarkdownRenderer
        content={thread.content}
        className="max-w-none min-w-0"
      />

      <Separator className="my-8" />

      <CommentsThread threadAuthorId={thread.author.id} />
    </div>
  )
}
