import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().trim().min(32),
    BETTER_AUTH_URL: z.url(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_ENDPOINT_URL_S3: z.url(),
    AWS_ENDPOINT_URL_IAM: z.url(),
    AWS_REGION: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
