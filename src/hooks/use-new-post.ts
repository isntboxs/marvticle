import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { orpc } from '#/orpc/client'
import {
  DEFAULT_POSTS_LIMIT,
  postsInfiniteQueryOptions,
} from '#/hooks/use-posts'

interface UseNewPostOptions {
  queryClient: QueryClient
  orpc: typeof orpc
  username: string
}

export const useNewPost = ({
  orpc,
  queryClient,
  username,
}: UseNewPostOptions) => {
  const navigate = useNavigate()

  return useMutation(
    orpc.posts.create.mutationOptions({
      onSuccess: (data) => {
        const isPublished = data.status === 'PUBLISHED'

        void queryClient.invalidateQueries({
          queryKey: postsInfiniteQueryOptions(DEFAULT_POSTS_LIMIT).queryKey,
        })

        toast.success(isPublished ? 'Post published' : 'Draft saved', {
          description: isPublished
            ? 'Your article is now live on the feed.'
            : 'Your draft is saved and only visible to you.',
        })

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
        toast.error('Failed to publish post', {
          description: error.message,
        })
      },
    })
  )
}
