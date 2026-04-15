import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { createPost, getPostById, getPosts } from './posts.api'
import { queryKeys } from '#/lib/api/query-keys'

export const usePostsInfiniteQuery = (limit = 10) =>
  useInfiniteQuery({
    queryKey: queryKeys.posts.list({ limit }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      getPosts(
        {
          limit,
          cursor: pageParam,
        },
        signal
      ).then((result) => result.data),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined,
  })

export const usePostDetailQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: ({ signal }) =>
      getPostById(id, signal).then((result) => result.data),
    enabled: Boolean(id),
  })

export const useCreatePostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
      })
    },
  })
}
