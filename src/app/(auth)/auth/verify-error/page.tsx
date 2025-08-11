'use client'

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Unknown error occurred'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">Verification failed</CardTitle>
          <CardDescription>
            {error === 'Token expired'
              ? 'Your verification link has expired. Please request a new one.'
              : error === 'Invalid token'
                ? 'The verification link is invalid or has already been used.'
                : error === 'Email already verified'
                  ? 'Your email is already verified. You can sign in to your account.'
                  : 'An error occurred during email verification.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error === 'Email already verified' ? (
            <Link href="/login" className="w-full">
              <Button className="w-full">Sign in to your account</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/verify-pending" className="w-full">
                <Button className="w-full">Request new verification email</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full">
                  Create new account
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
