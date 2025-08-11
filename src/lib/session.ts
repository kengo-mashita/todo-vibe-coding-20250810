import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'

import { authOptions } from '@/lib/auth'

export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireVerifiedUser(): Promise<Session> {
  const session = await requireAuth()
  if (!session.user.emailVerified) {
    throw new Error('Email not verified')
  }
  return session
}
