import { orpc } from '#/orpc/client'

export const authorProfileQueryOptions = (username: string) =>
  orpc.users.getAuthorByUsername.queryOptions({
    input: {
      username,
    },
    retry: false,
  })
