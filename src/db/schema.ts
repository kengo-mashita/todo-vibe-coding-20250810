// drizzle/schema.ts
import { randomUUID } from 'crypto' // ★ これだけ追加
import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

/** =========================
 *  User
 * ========================== */
export const users = pgTable(
  'user',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    username: varchar('username', { length: 8 }).notNull(),
    name: text('name'),
    image: text('image'),
    emailVerified: timestamp('email_verified', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    emailUnique: unique('user_email_unique').on(t.email),
    usernameUnique: unique('user_username_unique').on(t.username),
  }),
)

/** =========================
 *  Account（将来のOAuth等）
 * ========================== */
export const accounts = pgTable(
  'account',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (t) => ({
    pk: primaryKey({
      name: 'account_provider_providerAccountId_pk',
      columns: [t.provider, t.providerAccountId],
    }),
    userIdx: index('account_user_id_idx').on(t.userId),
  }),
)

/** =========================
 *  Session（DBセッション）
 * ========================== */
export const sessions = pgTable(
  'session',
  {
    sessionToken: text('session_token').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (t) => ({
    userIdx: index('session_user_id_idx').on(t.userId),
    expiresIdx: index('session_expires_idx').on(t.expires),
  }),
)

/** =========================
 *  VerificationToken（メール認証用）
 * ========================== */
export const verificationTokens = pgTable(
  'verification_token',
  {
    token: text('token').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (t) => ({
    userIdx: index('verification_token_user_id_idx').on(t.userId),
    expiresIdx: index('verification_token_expires_idx').on(t.expires),
  }),
)

/** =========================
 *  Task（ソフトデリート＆自動更新）
 * ========================== */
export const tasks = pgTable(
  'task',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 100 }).notNull(),
    isCompleted: boolean('is_completed').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => sql`now()`),
  },
  (t) => ({
    userIdx: index('task_user_id_idx').on(t.userId),
    statusIdx: index('task_status_idx').on(t.isCompleted),
    deletedIdx: index('task_deleted_at_idx').on(t.deletedAt),
  }),
)

/** =========================
 *  型エイリアス
 * ========================== */
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type VerificationToken = typeof verificationTokens.$inferSelect
export type NewVerificationToken = typeof verificationTokens.$inferInsert

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
