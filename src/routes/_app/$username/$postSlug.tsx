import { ChatCircleIcon, ThumbsUpIcon } from '@phosphor-icons/react'
import { cjk } from '@streamdown/cjk'
import { code } from '@streamdown/code'
import { math } from '@streamdown/math'
import { mermaid } from '@streamdown/mermaid'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { formatDate, formatDistanceToNowStrict } from 'date-fns'
import 'katex/dist/katex.min.css'
import { EyeIcon, ShareIcon } from 'lucide-react'
import { Streamdown } from 'streamdown'
import { useState } from 'react'

import { AspectRatio } from '#/components/ui/aspect-ratio'
import { Separator } from '#/components/ui/separator'
import { Skeleton } from '#/components/ui/skeleton'
import { UserAvatar } from '#/components/user-avatar'
import { postDetailQueryOptions } from '#/hooks/use-post-detail'
import { Button } from '#/components/ui/button'
import { PostShareDialog } from '#/components/post-share-dialog'

export const Route = createFileRoute('/_app/$username/$postSlug')({
  loader: async ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData(
      postDetailQueryOptions(params.username, params.postSlug)
    )
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.title} | marvticle`,
      },
    ],
  }),
  pendingComponent: PostDetailPending,
  component: RouteComponent,
})

function RouteComponent() {
  const [openShareDialog, setOpenShareDialog] = useState<boolean>(false)

  const { username, postSlug } = Route.useParams()

  const { data: post } = useSuspenseQuery(
    postDetailQueryOptions(username, postSlug)
  )

  const authorUsername = post.author.username

  const handleShareClick = () => {
    setOpenShareDialog((prev) => !prev)
  }

  return (
    <>
      <PostShareDialog
        open={openShareDialog}
        setOpen={setOpenShareDialog}
        postTitle={post.title}
        authorUsername={authorUsername}
      />
      <article className="flex flex-col">
        {post.coverImage && (
          <AspectRatio ratio={2.38 / 1} className="overflow-hidden border">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </AspectRatio>
        )}

        <header className="my-6 flex flex-col gap-6 px-6">
          <div className="flex items-center gap-3">
            <UserAvatar
              image={post.author.image}
              name={post.author.name}
              className="size-10"
            />

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold">{post.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  @{authorUsername}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Posted on{' '}
                  {formatDate(new Date(post.createdAt), 'MMM d, yyyy')}
                </p>

                <Separator
                  orientation="vertical"
                  className="rounded-full data-vertical:h-1 data-vertical:w-1 data-vertical:self-center"
                />

                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNowStrict(new Date(post.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
        </header>

        <Separator />

        <div className="my-2 flex items-center gap-2 px-6">
          <Button variant="ghost">
            <ThumbsUpIcon className="size-4" />
            {post.likesCount}
          </Button>

          <Button variant="ghost">
            <ChatCircleIcon className="size-4" />
            {post.commentsCount}
          </Button>

          <Button variant="ghost">
            <EyeIcon className="size-4" />
            {post.viewsCount}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="ms-auto"
            onClick={handleShareClick}
          >
            <ShareIcon className="size-4" />
            Share
          </Button>
        </div>

        <Separator className="mb-6" />

        <Streamdown
          plugins={{
            code: code,
            mermaid: mermaid,
            math: math,
            cjk: cjk,
          }}
          className="px-6"
        >
          {post.content}
        </Streamdown>
      </article>
    </>
  )
}

function PostDetailPending() {
  return (
    <article className="flex flex-col gap-8">
      <Skeleton className="h-7 w-36" />

      <header className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-72" />
        </div>
      </header>

      <Skeleton className="aspect-21/9 w-full" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-[96%]" />
        <Skeleton className="h-5 w-[92%]" />
        <Skeleton className="h-5 w-[88%]" />
      </div>
    </article>
  )
}
