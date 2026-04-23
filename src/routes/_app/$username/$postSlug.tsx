import 'katex/dist/katex.min.css'
import { formatDate, formatDistanceToNowStrict } from 'date-fns'
import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'
import { mermaid } from '@streamdown/mermaid'
import { math } from '@streamdown/math'
import { cjk } from '@streamdown/cjk'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  ChatCircleIcon,
  ThumbsUpIcon,
} from '@phosphor-icons/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { EyeIcon } from 'lucide-react'

import { AspectRatio } from '#/components/ui/aspect-ratio'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { Skeleton } from '#/components/ui/skeleton'
import { UserAvatar } from '#/components/user-avatar'
import { postDetailQueryOptions } from '#/hooks/use-post-detail'
import { getPostReadTime } from '#/lib/posts'

export const Route = createFileRoute('/_app/$username/$postSlug')({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.title} | marvticle`,
      },
    ],
  }),
  pendingComponent: PostDetailPending,
  loader: async ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData(
      postDetailQueryOptions(params.username, params.postSlug)
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { username, postSlug } = Route.useParams()
  const { data: post } = useSuspenseQuery(
    postDetailQueryOptions(username, postSlug)
  )
  const authorUsername = post.author.username ?? username

  return (
    <article className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/" viewTransition>
            <ArrowLeftIcon className="size-4" />
            Kembali ke feed
          </Link>
        </Button>

        <p className="text-sm text-muted-foreground">
          {getPostReadTime(post.content)} min read
        </p>
      </div>

      <header className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <UserAvatar
            image={post.author.image}
            name={post.author.name}
            className="size-12"
          />

          <div className="flex flex-col gap-1">
            <p className="font-medium">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">@{authorUsername}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>{formatDate(new Date(post.createdAt), 'PPP')}</span>
            <span>
              {formatDistanceToNowStrict(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUpIcon className="size-4" />
              {post.likesCount} likes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ChatCircleIcon className="size-4" />
              {post.commentsCount} comments
            </span>
            <span className="inline-flex items-center gap-1.5">
              <EyeIcon className="size-4" />
              {post.viewsCount} views
            </span>
          </div>
        </div>
      </header>

      {post.coverImageUrl ? (
        <AspectRatio ratio={2.38 / 1} className="overflow-hidden border">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </AspectRatio>
      ) : null}

      <Separator />

      <Streamdown
        plugins={{
          code: code,
          mermaid: mermaid,
          math: math,
          cjk: cjk,
        }}
      >
        {post.content}
      </Streamdown>
    </article>
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
