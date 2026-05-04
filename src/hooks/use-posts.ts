import { useSuspenseInfiniteQuery } from '@tanstack/react-query'

import { orpc } from '#/orpc/client'

export const DEFAULT_POSTS_LIMIT = 10

export const postsInfiniteQueryOptions = (limit = DEFAULT_POSTS_LIMIT) =>
  orpc.posts.getMany.infiniteOptions({
    input: (pageParam) => ({
      limit,
      cursor: typeof pageParam === 'string' ? pageParam : undefined,
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage: { nextCursor: string | null }) =>
      lastPage.nextCursor,
  })

export const authorPostsInfiniteQueryOptions = (
  authorUsername: string,
  limit = DEFAULT_POSTS_LIMIT
) =>
  orpc.posts.getMany.infiniteOptions({
    input: (pageParam) => ({
      limit,
      authorUsername,
      cursor: typeof pageParam === 'string' ? pageParam : undefined,
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage: { nextCursor: string | null }) =>
      lastPage.nextCursor,
  })

export function usePosts(limit = DEFAULT_POSTS_LIMIT) {
  const query = useSuspenseInfiniteQuery(postsInfiniteQueryOptions(limit))
  const posts = query.data.pages.flatMap((page) => page.items)

  return {
    ...query,
    posts,
    loadedPostsCount: posts.length,
  }
}

export function useAuthorPosts(
  authorUsername: string,
  limit = DEFAULT_POSTS_LIMIT
) {
  const query = useSuspenseInfiniteQuery(
    authorPostsInfiniteQueryOptions(authorUsername, limit)
  )
  const posts = query.data.pages.flatMap((page) => page.items)

  return {
    ...query,
    posts,
    loadedPostsCount: posts.length,
  }
}
