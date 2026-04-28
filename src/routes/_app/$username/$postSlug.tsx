import { ChatCircleIcon, ThumbsUpIcon } from '@phosphor-icons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { formatDate, formatDistanceToNowStrict } from 'date-fns'
import {
  BadgeCheckIcon,
  Building2Icon,
  CalendarIcon,
  EyeIcon,
  MapPinIcon,
  School2Icon,
  ShareIcon,
} from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { GeneratedBanner } from '#/components/generated-banner'
import { MarkdownRenderer } from '#/components/markdown-renderer'
import { PostShareDialog } from '#/components/post-share-dialog'
import { AspectRatio } from '#/components/ui/aspect-ratio'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { Skeleton } from '#/components/ui/skeleton'
import { UserAvatar } from '#/components/user-avatar'
import { postDetailQueryOptions } from '#/hooks/use-post-detail'
import { getStorageUrl } from '#/utils/storage'

export const Route = createFileRoute('/_app/$username/$postSlug')({
  loader: async ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData(
      postDetailQueryOptions(params.username, params.postSlug)
    )
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} | marvticle`
          : 'Post not found | marvticle',
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
    <PostDetailLayout
      leftAside={
        <EngagementActions
          likesCount={post.likesCount}
          commentsCount={post.commentsCount}
          viewsCount={post.viewsCount}
          onShare={handleShareClick}
        />
      }
      rightAside={<RelatedPostsSidebar />}
    >
      <main className="w-full min-w-0">
        <PostShareDialog
          open={openShareDialog}
          setOpen={setOpenShareDialog}
          postTitle={post.title}
          authorUsername={authorUsername}
        />

        <article className="flex min-w-0 flex-col">
          {post.coverImage && (
            <AspectRatio ratio={2.38 / 1} className="overflow-hidden border">
              <img
                src={getStorageUrl(post.coverImage)}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          )}

          <header className="my-6 flex min-w-0 flex-col gap-6 px-6">
            <div className="flex items-center gap-3">
              <UserAvatar
                image={post.author.image}
                name={post.author.name}
                className="size-10"
              />

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">
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
      leftAside={<RelatedPostsSidebar />}
      rightAside={<RelatedPostsSidebar />}
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
    <div className="container mx-auto grid w-full max-w-348 grid-cols-1 gap-4 px-4 py-20 md:px-6 xl:grid-cols-[minmax(0,3rem)_minmax(0,1fr)_minmax(0,24rem)]">
      <aside className="hidden min-w-0 xl:sticky xl:top-20 xl:block xl:max-h-[calc(100svh-5rem)] xl:self-start xl:overflow-y-auto">
        {leftAside}
      </aside>
      <div className="min-w-0">{children}</div>
      <aside className="hidden min-w-0 xl:sticky xl:top-20 xl:block xl:max-h-[calc(100svh-5rem)] xl:self-start xl:overflow-y-auto">
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
        <Button variant="ghost" size="icon-lg">
          <ThumbsUpIcon className="size-4" />
        </Button>
        <span className="text-xs">{likesCount}</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Button variant="ghost" size="icon-lg">
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
      >
        <ShareIcon className="size-4" />
      </Button>
    </div>
  )
}

function RelatedPostsSidebar() {
  const banner: string | null =
    'https://i.pinimg.com/originals/dc/3e/cd/dc3ecdab0fa15f3bd29d1e20718648e6.gif'
  const avatar: string | null =
    'https://i.pinimg.com/originals/1e/28/50/1e28507cdc5bfc16e9b2c575501216b4.gif'

  return (
    <div className="grid grid-cols-1 gap-y-16">
      <Card className="relative overflow-hidden py-0">
        <AspectRatio ratio={17 / 6}>
          {banner ? (
            <img
              src={banner}
              alt="Banner"
              className="h-full w-full object-cover"
            />
          ) : (
            <GeneratedBanner seed="isntboxs" />
          )}
        </AspectRatio>

        <CardHeader className="relative">
          <div className="absolute -top-10 left-4 after:absolute after:inset-0 after:outline-6 after:outline-card">
            <UserAvatar name="isntboxs" image={avatar} className="size-12" />
          </div>

          <div className="mt-6 flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="max-w-[20ch] truncate text-base font-semibold">
                  Moh Wanda Kemala Rizky
                </span>

                <BadgeCheckIcon className="size-4 fill-blue-500" />
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>@isntboxs</span>
                <Separator
                  orientation="vertical"
                  className="rounded-full data-vertical:h-1 data-vertical:w-1 data-vertical:self-center"
                />
                <span>he/him</span>
              </div>
            </div>

            <Button variant="outline" size="sm">
              Follow
            </Button>
          </div>

          <CardDescription className="mt-2 text-sm text-primary">
            Just an overworked millennial. Writing code the way I make my
            coffee: strong, clean, and with care. ☕
          </CardDescription>
        </CardHeader>

        <CardContent className="mb-6 grid grid-cols-1 place-items-start gap-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-4" />
            <span className="text-xs text-muted-foreground">
              Jakarta, Indonesia
            </span>
          </div>

          <div className="flex items-center gap-2">
            <School2Icon className="size-4" />
            <span className="text-xs text-muted-foreground">
              Universitas Indonesia
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Building2Icon className="size-4" />
            <span className="text-xs text-muted-foreground">
              Software Engineer at PT. XYZ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4" />
            <span className="text-xs text-muted-foreground">
              Joined at Jan 08, 2020
            </span>
          </div>
        </CardContent>
      </Card>

      {/* More from this author Card */}
    </div>
  )
}
