import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

import { db } from '@/db'
import { users } from '@/db/schema'
import { withErrorHandling, validateJson, createSuccessResponse } from '@/lib/api-utils'
import { hashPassword } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { ConflictError } from '@/lib/errors'
import { createVerificationToken } from '@/lib/tokens'
import { registerSchema } from '@/lib/validations'

export const POST = withErrorHandling(async (req: NextRequest) => {
  const data = await validateJson(req, registerSchema)

  const existingUserByEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1)
    .then((rows) => rows[0])

  if (existingUserByEmail) {
    throw new ConflictError('Email already registered')
  }

  const existingUserByUsername = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, data.username))
    .limit(1)
    .then((rows) => rows[0])

  if (existingUserByUsername) {
    throw new ConflictError('Username already taken')
  }

  const passwordHash = await hashPassword(data.password)

  const newUser = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      username: data.username,
      name: data.name || null,
    })
    .returning({ id: users.id, email: users.email })
    .then((rows) => rows[0])

  const verificationToken = await createVerificationToken(newUser.id)

  try {
    await sendVerificationEmail(newUser.email, verificationToken)
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }

  return createSuccessResponse(
    {
      message: 'Registration successful. Please check your email for verification instructions.',
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    },
    201,
  )
})
