import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  admin as adminPlugin,
  bearer as bearerPlugin,
  multiSession as multiSessionPlugin,
  openAPI as openAPIPlugin,
  username as usernamePlugin,
} from 'better-auth/plugins'

import * as schema from '#/db/schemas'
import { db } from '#/db'
import { env } from '#/lib/env/server'

export const auth = betterAuth({
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['github', 'google'],
    },
    encryptOAuthTokens: true,
  },
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.userTable,
      account: schema.accountTable,
      session: schema.sessionTable,
      verification: schema.verificationTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  plugins: [
    adminPlugin(),
    bearerPlugin(),
    multiSessionPlugin(),
    openAPIPlugin(),
    usernamePlugin(),
  ],
  secret: env.BETTER_AUTH_SECRET,
  session: {
    expiresIn: 60 * 60 * 24 * 3,
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: true,
        unique: true,
        input: false,
        fieldName: 'username',
      },
    },
  },
})
