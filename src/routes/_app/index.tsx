import { createFileRoute } from '@tanstack/react-router'

import { PostFeedCard } from '#/components/post-feed-card'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '#/components/ui/empty'
import { Skeleton } from '#/components/ui/skeleton'
import { Spinner } from '#/components/ui/spinner'
import {
  DEFAULT_POSTS_LIMIT,
  postsInfiniteQueryOptions,
  usePosts,
} from '#/hooks/use-posts'

export const Route = createFileRoute('/_app/')({
  pendingComponent: PostsFeedPending,
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchInfiniteQuery(
      postsInfiniteQueryOptions(DEFAULT_POSTS_LIMIT)
    )
  },
})

function RouteComponent() {
  const { posts, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePosts(DEFAULT_POSTS_LIMIT)

  return (
    <>
      {posts.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Belum ada post yang dipublikasikan</EmptyTitle>
            <EmptyDescription>
              Data akan muncul di sini setelah ada post dengan status
              <code className="mx-1">PUBLISHED</code>.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <section className="grid gap-4">
          {posts.map((post) => (
            <PostFeedCard {...post} key={post.id} />
          ))}
        </section>
      )}

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
    </>
  )
}

function PostsFeedPending() {
  return (
    <section className="grid gap-4">
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
    </section>
  )
}
