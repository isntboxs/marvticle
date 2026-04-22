/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_URL: z.url(),
  },

  runtimeEnv: {
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
  },
  emptyStringAsUndefined: true,
})
