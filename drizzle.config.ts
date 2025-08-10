import type { Config } from 'drizzle-kit'

const isProd = process.env.NODE_ENV === 'production'

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: isProd ? (process.env.DATABASE_URL ?? '') : (process.env.LOCAL_DATABASE_URL ?? ''),
  },
} satisfies Config
