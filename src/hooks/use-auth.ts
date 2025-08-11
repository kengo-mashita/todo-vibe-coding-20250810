import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user
  const isAuthenticated = !!user
  const isLoading = status === 'loading'
  const isVerified = user?.emailVerified !== null

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    isVerified,
    status,
  }
}
