import { createRouterClient } from '@orpc/server'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import type { ORPCRouterClient } from '#/orpc/routers'
import { orpcRouters } from '#/orpc/routers'
import { CreateORPCContext } from '#/orpc'

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(orpcRouters, {
      context: async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return CreateORPCContext({ headers: getRequestHeaders() })
      },
    })
  )
  .client((): ORPCRouterClient => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/orpc`,
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'include',
        })
      },
    })

    return createORPCClient(link)
  })

export const client: ORPCRouterClient = getORPCClient()
export const orpc = createTanstackQueryUtils(client)
