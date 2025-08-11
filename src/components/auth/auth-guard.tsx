'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/hooks/use-auth'

interface AuthGuardProps {
  children: React.ReactNode
  requireVerification?: boolean
}

export function AuthGuard({ children, requireVerification = true }: AuthGuardProps) {
  const { isAuthenticated, isVerified, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (requireVerification && !isVerified) {
      router.push('/auth/unverified')
      return
    }
  }, [isAuthenticated, isVerified, isLoading, router, requireVerification])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated || (requireVerification && !isVerified)) {
    return null
  }

  return <>{children}</>
}
