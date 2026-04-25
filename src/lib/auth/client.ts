import { createAuthClient } from 'better-auth/react'

import {
  adminClient,
  inferAdditionalFields,
  multiSessionClient,
  usernameClient,
} from 'better-auth/client/plugins'

import type { auth } from '#/lib/auth/server'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL,
  plugins: [
    usernameClient(),
    multiSessionClient(),
    adminClient(),
    inferAdditionalFields<typeof auth>(),
  ],
})
