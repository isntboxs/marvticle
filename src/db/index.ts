import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { env } from '#/lib/env/server'
import * as schema from '#/db/schemas'

function createDb() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  })

  return drizzle({ client: pool, schema })
}

export const db = createDb()
