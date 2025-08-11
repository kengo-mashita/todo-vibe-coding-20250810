import { randomUUID } from 'crypto'
import { eq, and } from 'drizzle-orm'

import { db } from '@/db'
import { verificationTokens, users } from '@/db/schema'

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24

export async function createVerificationToken(userId: string): Promise<string> {
  const token = randomUUID()
  const expires = new Date()
  expires.setHours(expires.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS)

  await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId))

  await db.insert(verificationTokens).values({
    token,
    userId,
    expires,
  })

  return token
}

export async function verifyToken(
  token: string,
): Promise<{ success: boolean; userId?: string; error?: string }> {
  const verificationToken = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1)
    .then((rows) => rows[0])

  if (!verificationToken) {
    return { success: false, error: 'Invalid token' }
  }

  if (verificationToken.expires < new Date()) {
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token))
    return { success: false, error: 'Token expired' }
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, verificationToken.userId))
    .limit(1)
    .then((rows) => rows[0])

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  if (user.emailVerified) {
    return { success: false, error: 'Email already verified' }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, verificationToken.userId))

    await tx.delete(verificationTokens).where(eq(verificationTokens.token, token))
  })

  return { success: true, userId: verificationToken.userId }
}

export async function isTokenValid(token: string): Promise<boolean> {
  const verificationToken = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
        // Only select non-expired tokens
        // This is a simple check, in production you might want more sophisticated handling
      ),
    )
    .limit(1)
    .then((rows) => rows[0])

  return verificationToken && verificationToken.expires > new Date()
}

export async function cleanupExpiredTokens(): Promise<number> {
  const result = await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.expires, new Date()))
    .execute()

  return result.rowCount || 0
}
