import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { formatDate } from 'date-fns'
import {
  BadgeCheckIcon,
  Building2Icon,
  CalendarIcon,
  MapPinIcon,
  School2Icon,
} from 'lucide-react'

import type { RouterOutputs } from '#/orpc/routers'
import { PostFeedCard } from '#/components/post-feed-card'
import { GeneratedBanner } from '#/components/generated-banner'
import { UserAvatar } from '#/components/user-avatar'
import { AspectRatio } from '#/components/ui/aspect-ratio'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '#/components/ui/empty'
import { Separator } from '#/components/ui/separator'
import { Skeleton } from '#/components/ui/skeleton'
import { Spinner } from '#/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { authorProfileQueryOptions } from '#/hooks/use-author-profile'
import {
  DEFAULT_POSTS_LIMIT,
  authorPostsInfiniteQueryOptions,
} from '#/hooks/use-posts'

export const Route = createFileRoute('/_app/$username/')({
  loader: async ({ context: { queryClient }, params }) => {
    await Promise.all([
      queryClient.ensureQueryData(authorProfileQueryOptions(params.username)),
      queryClient.prefetchInfiniteQuery(
        authorPostsInfiniteQueryOptions(params.username, DEFAULT_POSTS_LIMIT)
      ),
    ])
  },
  head: ({ params }) => {
    const title = `@${params.username} | marvticle`
    const description = `Check out @${params.username}'s profile and posts on marvticle.`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:site_name', content: 'marvticle' },
        { property: 'og:type', content: 'profile' },
        {
          property: 'og:url',
          content: `${import.meta.env.VITE_APP_URL}/${params.username}`,
        },
      ],
    }
  },
  pendingComponent: ProfilePending,
  component: RouteComponent,
})

function RouteComponent() {
  const { username } = Route.useParams()
  const { data: author } = useSuspenseQuery(authorProfileQueryOptions(username))

  return (
    <main className="container mx-auto flex w-full max-w-348 flex-col px-4 pt-14 pb-20 md:px-6">
      {/* ── Hero Section ── */}
      <ProfileHero author={author} />

      {/* ── Tabbed Content ── */}
      <Tabs defaultValue="posts" className="mt-6">
        <TabsList variant="line" className="w-full border-b">
          <TabsTrigger value="posts" className="text-sm">
            Posts
          </TabsTrigger>
          <TabsTrigger value="about" className="text-sm">
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <AuthorPostsFeed username={username} />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <AboutTab author={author} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

/* ─────────────────────────── Hero Section ─────────────────────────── */

type AuthorProfile = RouterOutputs['users']['getAuthorByUsername']

function ProfileHero({ author }: Readonly<{ author: AuthorProfile }>) {
  return (
    <div className="relative overflow-hidden rounded-b-xl border border-t-0">
      {/* Banner */}
      <AspectRatio ratio={4 / 1}>
        {author.banner ? (
          <img
            src={author.banner}
            alt={`${author.name}'s banner`}
            className="h-full w-full object-cover"
          />
        ) : (
          <GeneratedBanner seed={author.username} />
        )}
      </AspectRatio>

      {/* Profile info overlay */}
      <div className="relative px-6 pb-6">
        {/* Avatar – overlapping the banner */}
        <div className="absolute -top-10 left-6 after:absolute after:inset-0 after:outline-4 after:outline-background after:content-['']">
          <UserAvatar
            name={author.name}
            image={author.image}
            className="size-20 text-2xl"
          />
        </div>

        {/* Action row */}
        <div className="flex items-start justify-end pt-3">
          <Button variant="outline" size="sm">
            Follow
          </Button>
        </div>

        {/* Name + username */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{author.name}</h1>
            {author.verified ? (
              <BadgeCheckIcon className="size-5 fill-blue-500 text-white" />
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>@{author.username}</span>
            {author.pronouns ? (
              <>
                <Separator
                  orientation="vertical"
                  className="rounded-full data-vertical:h-1 data-vertical:w-1 data-vertical:self-center"
                />
                <span>{author.pronouns}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Bio */}
        {author.bio ? (
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground/90">
            {author.bio}
          </p>
        ) : null}

        {/* Metadata chips */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {author.location ? (
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              <span>{author.location}</span>
            </div>
          ) : null}

          {author.education ? (
            <div className="flex items-center gap-1.5">
              <School2Icon className="size-3.5" />
              <span>{author.education}</span>
            </div>
          ) : null}

          {author.work ? (
            <div className="flex items-center gap-1.5">
              <Building2Icon className="size-3.5" />
              <span>{author.work}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-1.5">
            <CalendarIcon className="size-3.5" />
            <span>
              Joined {formatDate(new Date(author.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Posts Feed Tab ─────────────────────────── */

function AuthorPostsFeed({ username }: Readonly<{ username: string }>) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      authorPostsInfiniteQueryOptions(username, DEFAULT_POSTS_LIMIT)
    )

  const posts = data.pages.flatMap((page) => page.items)

  if (posts.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No posts yet</EmptyTitle>
          <EmptyDescription>
            @{username} hasn't published any posts yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-4">
        {posts.map((post) => (
          <PostFeedCard {...post} key={post.id} />
        ))}
      </section>

      {hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Spinner />
                Loading more
              </>
            ) : (
              'Load more posts'
            )}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

/* ─────────────────────────── About Tab ─────────────────────────── */

function AboutTab({ author }: Readonly<{ author: AuthorProfile }>) {
  const details = [
    author.location
      ? { icon: MapPinIcon, label: 'Location', value: author.location }
      : null,
    author.education
      ? { icon: School2Icon, label: 'Education', value: author.education }
      : null,
    author.work
      ? { icon: Building2Icon, label: 'Work', value: author.work }
      : null,
    {
      icon: CalendarIcon,
      label: 'Joined',
      value: formatDate(new Date(author.createdAt), 'MMMM d, yyyy'),
    },
  ].filter(Boolean)

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">About @{author.username}</h2>
      </CardHeader>

      <CardContent className="grid gap-4">
        {author.bio ? (
          <p className="text-sm leading-relaxed text-foreground/90">
            {author.bio}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No bio provided.
          </p>
        )}

        <Separator />

        <dl className="grid gap-3">
          {details.map((detail) => {
            if (!detail) return null
            const Icon = detail.icon
            return (
              <div
                key={detail.label}
                className="flex items-center gap-3 text-sm"
              >
                <Icon className="size-4 text-muted-foreground" />
                <dt className="sr-only">{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            )
          })}
        </dl>
      </CardContent>
    </Card>
  )
}

/* ─────────────────────────── Pending / Skeleton ─────────────────────────── */

function ProfilePending() {
  return (
    <main className="container mx-auto flex w-full max-w-4xl flex-col pb-20">
      {/* Banner skeleton */}
      <div className="relative overflow-hidden rounded-b-xl border border-t-0">
        <Skeleton className="aspect-4/1 w-full" />

        <div className="relative px-6 pb-6">
          <Skeleton className="absolute -top-10 left-6 size-20 rounded-full" />

          <div className="flex justify-end pt-3">
            <Skeleton className="h-8 w-20" />
          </div>

          <div className="mt-2 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          <Skeleton className="mt-3 h-12 w-full max-w-md" />

          <div className="mt-4 flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-6 flex gap-4 border-b pb-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-14" />
      </div>

      {/* Post cards skeleton */}
      <div className="mt-6 grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border">
            <CardHeader className="gap-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-[84%]" />
            </CardContent>
            <CardFooter className="gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
