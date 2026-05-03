import { createAuthClient } from 'better-auth/react'

import {
  adminClient,
  inferAdditionalFields,
  multiSessionClient,
  usernameClient,
} from 'better-auth/client/plugins'
import { sentinelClient } from '@better-auth/infra/client'

import type { auth } from '#/lib/auth/server'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL,
  plugins: [
    sentinelClient({ autoSolveChallenge: true }),
    usernameClient(),
    multiSessionClient(),
    adminClient(),
    inferAdditionalFields<typeof auth>(),
  ],
})
