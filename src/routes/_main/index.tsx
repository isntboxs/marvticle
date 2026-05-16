import { createFileRoute } from '@tanstack/react-router'

import { MessagesSquareIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { UserAvatar } from '#/components/user-avatar'
import { FeedThreads } from '#/features/threads/components/feed-threads'

export const Route = createFileRoute('/_main/')({
  beforeLoad: () => {
    return { breadcrumb: 'Home' }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const navigate = Route.useNavigate()

  const handleCreatePost = () => {
    void navigate({ to: '/threads/new', replace: true, viewTransition: true })
  }

  return (
    <div className="container mx-auto w-full max-w-2xl px-4 pt-4 pb-8">
      {!!auth && (
        <button
          className="flex w-full cursor-text items-center justify-between gap-4"
          onClick={handleCreatePost}
        >
          <UserAvatar name={auth.user.username} image={auth.user.image} />

          <div className="flex flex-1">
            <span className="w-[20ch] cursor-default truncate font-heading text-lg text-muted-foreground select-none">
              What's on your mind?
            </span>
          </div>

          <MessagesSquareIcon className="text-muted-foreground" />
        </button>
      )}

      <div className="my-4 flex w-full items-center justify-between gap-4 border border-x-0 border-border py-2">
        <Button type="button" variant="secondary" size="sm">
          Latest
        </Button>
      </div>

      <FeedThreads />
    </div>
  )
}
