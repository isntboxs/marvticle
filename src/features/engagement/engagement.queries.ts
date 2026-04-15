import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createComment,
  deleteComment,
  getComments,
  getCommentsCount,
  getLikesCount,
  getViewsCount,
  toggleLike,
  trackView,
  updateComment,
} from './engagement.api'
import { queryKeys } from '#/lib/api/query-keys'

export const useCommentsQuery = (postId: string, page = 1, limit = 20) =>
  useQuery({
    queryKey: queryKeys.engagement.comments({ postId, page, limit }),
    queryFn: ({ signal }) =>
      getComments({ postId, page, limit }, signal).then((result) => result.data),
    enabled: Boolean(postId),
  })

export const useLikesCountQuery = (postId: string) =>
  useQuery({
    queryKey: queryKeys.engagement.likesCount(postId),
    queryFn: ({ signal }) =>
      getLikesCount(postId, signal).then((result) => result.data),
    enabled: Boolean(postId),
    staleTime: 15_000,
  })

export const useCommentsCountQuery = (postId: string) =>
  useQuery({
    queryKey: queryKeys.engagement.commentsCount(postId),
    queryFn: ({ signal }) =>
      getCommentsCount(postId, signal).then((result) => result.data),
    enabled: Boolean(postId),
    staleTime: 15_000,
  })

export const useViewsCountQuery = (postId: string) =>
  useQuery({
    queryKey: queryKeys.engagement.viewsCount(postId),
    queryFn: ({ signal }) =>
      getViewsCount(postId, signal).then((result) => result.data),
    enabled: Boolean(postId),
    staleTime: 15_000,
  })

export const useToggleLikeMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleLike({ postId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.likesCount(postId),
      })

      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
      })

      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts.detail(postId),
      })
    },
  })
}

export const useCreateCommentMutation = (postId: string, page = 1, limit = 20) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createComment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments({ postId, page, limit }),
      })

      await queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.commentsCount(postId),
      })
    },
  })
}

export const useUpdateCommentMutation = (postId: string, page = 1, limit = 20) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateComment(id, { content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments({ postId, page, limit }),
      })
    },
  })
}

export const useDeleteCommentMutation = (postId: string, page = 1, limit = 20) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments({ postId, page, limit }),
      })

      await queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.commentsCount(postId),
      })
    },
  })
}

export const useTrackViewMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => trackView({ postId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.viewsCount(postId),
      })
    },
  })
}
