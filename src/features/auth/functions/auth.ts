// oxlint-disable typescript/no-unsafe-assignment
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders, setResponseStatus } from '@tanstack/react-start/server'

import { changePasswordSchema } from '#/features/auth/schemas/auth.schema'
import { authClient } from '#/lib/auth/client'
import { auth } from '#/lib/auth/server'
import { authMiddleware } from '#/middlewares/auth'

export const listUserAccountsFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.auth) {
      setResponseStatus(401)
      throw new Error('Unauthorized')
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
      setResponseStatus(401)
      throw new Error('Unauthorized')
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

export const changePasswordFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(changePasswordSchema)
  .handler(async ({ context, data }) => {
    if (!context.auth) {
      setResponseStatus(401)
      throw new Error('Unauthorized')
    }

    const headers = getRequestHeaders()

    const changePassword = await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      },

      headers,
    })

    return changePassword
  })
