'use client'

import { Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyPendingPage() {
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    const email = localStorage.getItem('pendingVerificationEmail')
    if (!email) {
      toast.error('No email found for resending verification')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/verify/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Verification email sent successfully')
      } else {
        toast.error(result.error?.message || 'Failed to resend verification email')
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('An error occurred while resending the email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to your email address. Click the link to verify your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">Didn&apos;t receive the email?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>The link expires in 24 hours</li>
            </ul>
          </div>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleResend}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? 'Resending...' : 'Resend verification email'}
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
