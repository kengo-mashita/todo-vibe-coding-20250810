import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { accounts, sessions, tasks, users, verificationTokens } from '@/db/schema'
import { withErrorHandling } from '@/lib/api-utils'
import { requireAuth } from '@/lib/session'

export const DELETE = withErrorHandling(async () => {
  const session = await requireAuth()

  await db.transaction(async (tx) => {
    await tx.delete(tasks).where(eq(tasks.userId, session.user.id))

    await tx.delete(sessions).where(eq(sessions.userId, session.user.id))

    await tx.delete(accounts).where(eq(accounts.userId, session.user.id))

    await tx.delete(verificationTokens).where(eq(verificationTokens.userId, session.user.id))

    await tx.delete(users).where(eq(users.id, session.user.id))
  })

  return new Response(null, { status: 204 })
})
