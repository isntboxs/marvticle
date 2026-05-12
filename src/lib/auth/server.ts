import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import {
  admin as adminPlugin,
  bearer as bearerPlugin,
  multiSession as multiSessionPlugin,
  openAPI as openAPIPlugin,
  username as usernamePlugin,
} from 'better-auth/plugins'
import { dash as dashPlugin } from '@better-auth/infra'
import { Resend } from 'resend'

import * as schema from '#/db/schemas'
import { db } from '#/db'
import { env } from '#/lib/env/server'
import { PasswordResetEmail } from '#/components/email/reset-password-email'

const resend = new Resend(env.RESEND_API_KEY)

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
    resetPasswordTokenExpiresIn: 60 * 60 * 1, // 1 hour
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }, _request) => {
      await resend.emails.send({
        from: 'Marvticle <onboarding@resend.dev>',
        to: user.email,
        subject: 'Reset your Marvticle password',
        react: PasswordResetEmail({
          appUrl: env.BETTER_AUTH_URL,
          resetUrl: url,
          userEmail: user.email,
          userName: user.name,
        }),
      })
    },
  },
  plugins: [
    dashPlugin({
      apiKey: env.BETTER_AUTH_API_KEY,
    }),
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
  socialProviders: {
    github: {
      enabled: true,
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: true,
        unique: true,
        input: true,
        fieldName: 'username',
      },
      banner: {
        type: 'string',
        required: false,
        input: true,
        fieldName: 'banner',
      },
      bio: {
        type: 'string',
        required: false,
        input: true,
        fieldName: 'bio',
      },
      pronouns: {
        type: 'string',
        required: false,
        input: true,
        fieldName: 'pronouns',
      },
      location: {
        type: 'string',
        required: false,
        input: true,
        fieldName: 'location',
      },
      education: {
        type: 'string',
        required: false,
        input: true,
        fieldName: 'education',
      },
      work: {
        type: 'string',
        required: false,
        input: true,
        fieldName: 'work',
      },
    },
  },
})
