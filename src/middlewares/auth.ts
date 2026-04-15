import { createMiddleware } from '@tanstack/react-start'

import { authClient } from '#/lib/auth-client'

export const authMiddleware = createMiddleware().server(
  async ({ request, next }) => {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: request.headers,
        throw: true,
      },
    })

    return next({
      context: { auth: session },
    })
  }
)
