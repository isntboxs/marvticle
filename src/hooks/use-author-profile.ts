import { orpc } from '#/orpc/client'

export const authorProfileQueryOptions = (username: string) =>
  orpc.users.getUserByUsername.queryOptions({
    input: {
      username,
    },
    retry: false,
  })
