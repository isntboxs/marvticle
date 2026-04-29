import { useSuspenseQuery } from '@tanstack/react-query'

import { orpc } from '#/orpc/client'

export const postDetailQueryOptions = (username: string, slug: string) =>
  orpc.posts.getOneByUsernameAndSlug.queryOptions({
    input: {
      username,
      slug,
    },
  })

export const editablePostDetailQueryOptions = (username: string, slug: string) =>
  orpc.posts.getEditableByUsernameAndSlug.queryOptions({
    input: {
      username,
      slug,
    },
  })

export const usePostDetail = (username: string, slug: string) => {
  return useSuspenseQuery(postDetailQueryOptions(username, slug))
}

export const useEditablePostDetail = (username: string, slug: string) => {
  return useSuspenseQuery(editablePostDetailQueryOptions(username, slug))
}
