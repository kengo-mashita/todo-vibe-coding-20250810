import { env } from '@/lib/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const connectionString = env.DATABASE_URL ?? env.LOCAL_DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL or LOCAL_DATABASE_URL must be set')
}

export const pool = new Pool({
  connectionString,
  max: 10, // 同時接続上限
  ssl: env.DATABASE_URL ? { rejectUnauthorized: false } : undefined, // NeonはSSL必須
})

export const db = drizzle(pool)
