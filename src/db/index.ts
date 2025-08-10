import { env } from '@/lib/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const isProd = env.NODE_ENV === 'production'
const connectionString = isProd ? env.DATABASE_URL : env.LOCAL_DATABASE_URL

if (!connectionString) {
  throw new Error(
    isProd
      ? 'DATABASE_URL must be set in production'
      : 'LOCAL_DATABASE_URL must be set in development/test',
  )
}

const globalForDb = global as unknown as { __pool?: Pool; __db?: ReturnType<typeof drizzle> }

export const pool =
  globalForDb.__pool ??
  new Pool({
    connectionString,
    max: 10,
    ssl: isProd ? { rejectUnauthorized: false } : undefined,
  })

export const db = globalForDb.__db ?? drizzle(pool)

if (!isProd) {
  globalForDb.__pool = pool
  globalForDb.__db = db
}

export const runtime = 'nodejs' as const
