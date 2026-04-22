import { implement } from '@orpc/server'

import { orpcContracts } from '#/orpc/contracts'
import { db } from '#/db'
import { auth } from '#/lib/auth/server'

export const CreateORPCContext = async ({ headers }: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers })

  return {
    auth: session,
    db,
  }
}

type ORPCContext = Awaited<ReturnType<typeof CreateORPCContext>>

export const orpcBase = implement(orpcContracts).$context<ORPCContext>()
