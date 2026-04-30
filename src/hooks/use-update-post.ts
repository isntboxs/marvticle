import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import type { orpc } from '#/orpc/client'
import {
  editablePostDetailQueryOptions,
  postDetailQueryOptions,
} from '#/hooks/use-post-detail'
import {
  DEFAULT_POSTS_LIMIT,
  postsInfiniteQueryOptions,
} from '#/hooks/use-posts'

interface UseUpdatePostOptions {
  queryClient: QueryClient
  orpc: typeof orpc
  username: string
}

export const useUpdatePost = ({
  orpc,
  queryClient,
  username,
}: UseUpdatePostOptions) => {
  const navigate = useNavigate()

  return useMutation(
    orpc.posts.update.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: editablePostDetailQueryOptions(username, data.slug)
            .queryKey,
        })

        void queryClient.invalidateQueries({
          queryKey: postDetailQueryOptions(username, data.slug).queryKey,
        })

        void queryClient.invalidateQueries({
          queryKey: postsInfiniteQueryOptions(DEFAULT_POSTS_LIMIT).queryKey,
        })

        toast.success('Post updated')

        void navigate({
          to: '/$username/$postSlug',
          params: {
            username,
            postSlug: data.slug,
          },
          viewTransition: true,
        })
      },

      onError: (error) => {
        toast.error('Failed to update post', {
          description: error.message,
        })
      },
    })
  )
}
