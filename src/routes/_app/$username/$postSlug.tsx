import { ChatCircleIcon, ThumbsUpIcon } from '@phosphor-icons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { formatDate, formatDistanceToNowStrict } from 'date-fns'
import { AlertCircleIcon, EyeIcon, ShareIcon } from 'lucide-react'
import { Activity, Suspense, useState } from 'react'
import type { ReactNode } from 'react'

import type { RouterOutputs } from '#/orpc/routers'
import {
  AuthorCard,
  AuthorCardFallback,
  AuthorCardSkeleton,
} from '#/components/author-card'
import { MarkdownRenderer } from '#/components/markdown-renderer'
import { PostShareDialog } from '#/components/post-share-dialog'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { AspectRatio } from '#/components/ui/aspect-ratio'
import { Button } from '#/components/ui/button'
import { ButtonGroup } from '#/components/ui/button-group'
import { Separator } from '#/components/ui/separator'
import { Skeleton } from '#/components/ui/skeleton'
import { UserAvatar } from '#/components/user-avatar'
import { authorProfileQueryOptions } from '#/hooks/use-author-profile'
import { postDetailQueryOptions } from '#/hooks/use-post-detail'
import { cn } from '#/lib/utils'
import { getStorageUrl } from '#/utils/storage'
import { parseMarkdownToWords } from '#/utils/parse-markdown.ts'

export const Route = createFileRoute('/_app/$username/$postSlug')({
  loader: async ({ context: { queryClient }, params }) => {
    const [post, author] = await Promise.all([
      queryClient.ensureQueryData(
        postDetailQueryOptions(params.username, params.postSlug)
      ),
      queryClient.ensureQueryData(authorProfileQueryOptions(params.username)),
    ])

    return { post, author }
  },
  head: ({ loaderData, params }) => {
    const title = loaderData
      ? `${loaderData.post.title} | marvticle`
      : 'Post not found | marvticle'
    const description = loaderData
      ? parseMarkdownToWords(loaderData.post.content)
      : ''
    const ogUrl = loaderData
      ? `${import.meta.env.VITE_APP_URL}/api/og?title=${encodeURIComponent(loaderData.post.title)}&description=${encodeURIComponent(description)}&authorName=${encodeURIComponent(loaderData.post.author.name)}&authorUsername=${encodeURIComponent(params.username)}${loaderData.author.image ? `&authorImage=${encodeURIComponent(loaderData.author.image)}` : ''}`
      : `${import.meta.env.VITE_APP_URL}/api/og`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        // Open Graph
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:site_name', content: 'marvticle' },
        { property: 'og:image', content: ogUrl },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:url',
          content: `${import.meta.env.VITE_APP_URL}/${params.username}/${params.postSlug}`,
        },
        // Twitter
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        {
          name: 'twitter:url',
          content: `${import.meta.env.VITE_APP_URL}/${params.username}/${params.postSlug}`,
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: ogUrl },
      ],
    }
  },
  pendingComponent: PostDetailPending,
  component: RouteComponent,
})

function RouteComponent() {
  const [openShareDialog, setOpenShareDialog] = useState<boolean>(false)

  const { auth } = Route.useRouteContext()
  const { username, postSlug } = Route.useParams()

  const { data: post } = useSuspenseQuery(
    postDetailQueryOptions(username, postSlug)
  )
  const authorQuery = useSuspenseQuery(authorProfileQueryOptions(username))

  const authorUsername = post.author.username
  const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null
  const updatedAt = new Date(post.updatedAt)
  const showUpdatedAt =
    publishedAt !== null && updatedAt.getTime() > publishedAt.getTime()
  const unpublishedStatusLabel =
    post.status === 'DRAFT'
      ? 'Draft'
      : post.status === 'ARCHIVED'
        ? 'Archived'
        : 'Unpublished'

  const handleShareClick = () => {
    setOpenShareDialog((prev) => !prev)
  }

  return (
    <PostDetailLayout
      leftAside={
        <EngagementActions
          likesCount={post.likesCount}
          commentsCount={post.commentsCount}
          viewsCount={post.viewsCount}
          onShare={handleShareClick}
        />
      }
      rightAside={
        <Suspense fallback={<AuthorCardSkeleton />}>
          <AuthorRelatedPostsSidebar
            authorProfile={authorQuery.data}
            fallbackAuthor={post.author}
          />
        </Suspense>
      }
    >
      <main className="w-full min-w-0">
        <PostShareDialog
          open={openShareDialog}
          setOpen={setOpenShareDialog}
          postTitle={post.title}
          authorUsername={authorUsername}
        />

        <article className="flex min-w-0 flex-col">
          <Activity mode={post.status === 'PUBLISHED' ? 'hidden' : 'visible'}>
            <div className="-mt-2 mb-4 lg:mt-0">
              <Alert
                variant="destructive"
                className="border-destructive/30 bg-destructive/15"
              >
                <AlertCircleIcon />

                <AlertTitle>Unpublished Post.</AlertTitle>

                <AlertDescription>
                  This URL is public but secret, so share at your own
                  discretion.
                </AlertDescription>
              </Alert>
            </div>
          </Activity>

          {post.coverImage && (
            <AspectRatio ratio={2.38 / 1} className="overflow-hidden border">
              <img
                src={getStorageUrl(post.coverImage)}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          )}

          <header
            className={cn(
              'my-6 flex min-w-0 flex-col gap-6 px-6',
              !post.coverImage && 'mt-0'
            )}
          >
            <div className="flex max-md:flex-col max-md:gap-y-6 md:items-center md:justify-between">
              <PostActions
                authUsername={auth?.user.username}
                authorUsername={authorUsername}
                slug={post.slug}
                status={post.status}
                className="md:hidden"
              />

              <div className="flex items-center gap-3">
                <UserAvatar
                  image={post.author.image}
                  name={post.author.name}
                  className="size-10"
                />

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">
                      {post.author.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{authorUsername}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {publishedAt
                        ? `Posted on ${formatDate(publishedAt, 'MMM d, yyyy')}`
                        : unpublishedStatusLabel}
                    </p>

                    {showUpdatedAt && (
                      <>
                        <Separator
                          orientation="vertical"
                          className="rounded-full data-vertical:h-1 data-vertical:w-1 data-vertical:self-center"
                        />

                        <p className="text-xs text-muted-foreground">
                          Updated{' '}
                          {formatDistanceToNowStrict(updatedAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <PostActions
                authUsername={auth?.user.username}
                authorUsername={authorUsername}
                slug={post.slug}
                status={post.status}
                className="hidden md:flex"
              />
            </div>

            <h1 className="mb-4 text-3xl leading-tight font-bold tracking-tight wrap-break-word sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
          </header>

          <MarkdownRenderer
            content={post.content}
            className="max-w-none min-w-0 px-6 wrap-break-word **:min-w-0 [&_li]:wrap-break-word [&_p]:wrap-break-word [&_pre]:overflow-x-auto"
          />
        </article>
      </main>
    </PostDetailLayout>
  )
}

function PostDetailPending() {
  return (
    <PostDetailLayout
      leftAside={<EngagementActionsSkeleton />}
      rightAside={<AuthorCardSkeleton />}
    >
      <article className="flex min-w-0 flex-col">
        <Skeleton className="aspect-[2.38/1] w-full" />

        <header className="my-6 flex min-w-0 flex-col gap-6 px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />

            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-5 w-72" />
          </div>
        </header>

        <Separator />

        <div className="my-2 flex items-center gap-2 px-6">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="ms-auto h-9 w-24" />
        </div>

        <Separator className="mb-6" />

        <div className="space-y-3 px-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[96%]" />
          <Skeleton className="h-5 w-[92%]" />
          <Skeleton className="h-5 w-[88%]" />
        </div>
      </article>
    </PostDetailLayout>
  )
}

function EngagementActionsSkeleton() {
  return (
    <div className="flex h-72 flex-col items-center gap-y-4 overflow-hidden">
      <div className="flex flex-col items-center gap-1">
        <Skeleton className="size-11" />
        <Skeleton className="h-3 w-6" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <Skeleton className="size-11" />
        <Skeleton className="h-3 w-6" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <Skeleton className="size-7" />
        <Skeleton className="h-3 w-6" />
      </div>

      <Skeleton className="mt-auto size-11" />
    </div>
  )
}

function PostDetailLayout({
  children,
  leftAside,
  rightAside,
}: Readonly<{
  children: ReactNode
  leftAside?: ReactNode
  rightAside?: ReactNode
}>) {
  return (
    <div className="container mx-auto grid w-full max-w-348 grid-cols-1 gap-4 py-18 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] xl:grid-cols-[minmax(0,3rem)_minmax(0,1fr)_minmax(0,24rem)]">
      <aside className="hidden min-w-0 xl:sticky xl:top-18 xl:block xl:max-h-[calc(100svh-5rem)] xl:self-start xl:overflow-y-auto">
        {leftAside}
      </aside>
      <div className="min-w-0">{children}</div>
      <aside className="hidden min-w-0 lg:block xl:sticky xl:top-18 xl:max-h-[calc(100svh-5rem)] xl:self-start xl:overflow-y-auto">
        {rightAside}
      </aside>
    </div>
  )
}

const EngagementActions = ({
  likesCount,
  commentsCount,
  viewsCount,
  onShare,
}: {
  likesCount: number
  commentsCount: number
  viewsCount: number
  onShare?: () => void
}) => {
  return (
    <div className="flex h-72 flex-col items-center gap-y-4 overflow-hidden">
      <div className="flex flex-col items-center gap-1">
        <Button variant="ghost" size="icon-lg" aria-label="Like post" disabled>
          <ThumbsUpIcon className="size-4" />
        </Button>
        <span className="text-xs">{likesCount}</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Open comments"
          disabled
        >
          <ChatCircleIcon className="size-4" />
        </Button>
        <span className="text-xs">{commentsCount}</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <EyeIcon className="m-1.5 size-4" />
        <span className="text-xs">{viewsCount}</span>
      </div>

      <Button
        variant="ghost"
        size="icon-lg"
        className="mt-auto"
        onClick={onShare}
        aria-label="Share post"
      >
        <ShareIcon className="size-4" />
      </Button>
    </div>
  )
}

function AuthorRelatedPostsSidebar({
  authorProfile,
  fallbackAuthor,
}: Readonly<{
  authorProfile?: RouterOutputs['users']['getAuthorByUsername']
  fallbackAuthor: RouterOutputs['posts']['getMany']['items'][number]['author']
}>) {
  return (
    <div className="grid grid-cols-1 gap-y-16">
      {authorProfile ? <AuthorCard author={authorProfile} /> : null}
      {!authorProfile ? <AuthorCardFallback author={fallbackAuthor} /> : null}

      {/* More from this author Card */}
    </div>
  )
}

type PostActionsProps = {
  authUsername: string | undefined
  authorUsername: string
  slug: string
  status: RouterOutputs['posts']['getMany']['items'][number]['status']
  className?: string
}

const PostActions = ({
  authUsername,
  authorUsername,
  slug,
  status,
  className,
}: PostActionsProps) => {
  return (
    <Activity mode={authUsername === authorUsername ? 'visible' : 'hidden'}>
      <ButtonGroup className={cn(className)}>
        <Button variant="outline" asChild>
          <Link
            to="/$username/$postSlug/edit"
            params={{ username: authorUsername, postSlug: slug }}
          >
            Edit
          </Link>
        </Button>
        <Activity mode={status !== 'PUBLISHED' ? 'hidden' : 'visible'}>
          <Button variant="outline">Manage</Button>
        </Activity>
        <Button variant="outline">Stats</Button>
      </ButtonGroup>
    </Activity>
  )
}
