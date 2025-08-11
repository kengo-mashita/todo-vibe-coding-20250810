import type { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      emailVerified: Date | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    emailVerified: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    emailVerified: Date | null
  }
}
