import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

import { withErrorHandling } from '@/lib/api-utils'
import { AppError } from '@/lib/errors'
import { verifyToken } from '@/lib/tokens'

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    throw new AppError('Token is required', 'MISSING_TOKEN', 400)
  }

  const result = await verifyToken(token)

  if (!result.success) {
    redirect(`/auth/verify-error?error=${encodeURIComponent(result.error || 'Unknown error')}`)
  }

  redirect('/auth/verify-success')
})
