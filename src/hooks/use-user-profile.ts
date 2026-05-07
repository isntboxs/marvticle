import { useSuspenseQuery } from '@tanstack/react-query'
import { orpc } from '#/orpc/client'

export const userProfileQueryOptions = (username: string) =>
  orpc.users.getUserByUsername.queryOptions({
    input: {
      username,
    },
    retry: false,
  })

export const useUserProfile = (username: string) =>
  useSuspenseQuery(userProfileQueryOptions(username))
