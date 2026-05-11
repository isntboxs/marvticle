// oxlint-disable typescript/no-unsafe-assignment
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { authClient } from '#/lib/auth/client'
import { authMiddleware } from '#/middlewares/auth'

export const listUserAccountsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.auth) {
      throw new Error('Not authenticated')
    }

    const headers = getRequestHeaders()

    const listAccounts = await authClient.listAccounts({
      fetchOptions: {
        headers,
        throw: true,
      },
    })

    return listAccounts
  })

export const listSessionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.auth) {
      throw new Error('Not authenticated')
    }

    const headers = getRequestHeaders()

    const listSessions = await authClient.listSessions({
      fetchOptions: {
        headers,
        throw: true,
      },
    })

    return listSessions
  })
