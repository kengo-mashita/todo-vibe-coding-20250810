import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

import { db } from '@/db'
import { users } from '@/db/schema'
import { withErrorHandling, validateJson, createSuccessResponse } from '@/lib/api-utils'
import { sendVerificationEmail } from '@/lib/email'
import { AppError, NotFoundError } from '@/lib/errors'
import { createVerificationToken } from '@/lib/tokens'
import { emailSchema } from '@/lib/validations'

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { email } = await validateJson(req, emailSchema.shape)

  const user = await db
    .select({
      id: users.id,
      email: users.email,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rows) => rows[0])

  if (!user) {
    throw new NotFoundError('User not found')
  }

  if (user.emailVerified) {
    throw new AppError('Email already verified', 'EMAIL_ALREADY_VERIFIED', 400)
  }

  const verificationToken = await createVerificationToken(user.id)

  try {
    await sendVerificationEmail(user.email, verificationToken)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new AppError('Failed to send verification email', 'EMAIL_SEND_FAILED', 500)
  }

  return createSuccessResponse({
    message: 'Verification email sent successfully',
  })
})
