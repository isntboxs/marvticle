/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { authMiddleware } from '#/middlewares/auth'
import { auth } from '#/lib/auth/server'

export const listUserSessionsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.auth) {
      throw new Error('Not authenticated')
    }

    const headers = getRequestHeaders()

    const listSessions = await auth.api.listSessions({
      headers,
    })

    return listSessions
  })
