'use client'

import { AlertTriangle, Mail } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

export default function UnverifiedPage() {
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    if (!user?.email) {
      toast.error('No email address found')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/verify/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
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

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Email verification required</CardTitle>
          <CardDescription>
            You need to verify your email address before you can use Todo Vibe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Verification email sent to:</p>
                <p className="text-sm text-blue-700 font-mono break-all">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">Didn&apos;t receive the email?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Check your spam folder</li>
              <li>Make sure the email address is correct</li>
              <li>The verification link expires in 24 hours</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <Button onClick={handleResend} disabled={isResending} className="w-full">
              {isResending ? 'Resending...' : 'Resend verification email'}
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
