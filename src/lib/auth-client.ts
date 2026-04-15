import { createAuthClient } from 'better-auth/react'

import {
  adminClient,
  multiSessionClient,
  usernameClient,
} from 'better-auth/client/plugins'

import { env } from '#/lib/env'

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  basePath: '/auth/api',
  plugins: [usernameClient(), multiSessionClient(), adminClient()],
})
