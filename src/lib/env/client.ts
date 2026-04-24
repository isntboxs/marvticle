/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_URL: z.url(),
    VITE_S3_BUCKET_NAME: z.string(),
    VITE_S3_PUBLIC_BASE_URL: z.url().optional(),
  },

  runtimeEnv: {
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    VITE_S3_BUCKET_NAME: import.meta.env.VITE_S3_BUCKET_NAME,
    VITE_S3_PUBLIC_BASE_URL: import.meta.env.VITE_S3_PUBLIC_BASE_URL,
  },
  emptyStringAsUndefined: true,
})
