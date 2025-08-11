import { config } from 'dotenv'
config({ path: '.env' })

import { eq } from 'drizzle-orm'
import { db } from '../src/db'
import { users } from '../src/db/schema'

async function verifyUser(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`)

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0])

    if (!user) {
      console.log('User not found')
      return
    }

    console.log('Current user:', {
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
    })

    if (user.emailVerified) {
      console.log('User is already verified')
      return
    }

    // Update user to set email_verified
    const updatedUser = await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, user.id))
      .returning()
      .then((rows) => rows[0])

    console.log('User verification updated:', {
      id: updatedUser.id,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
    })

    console.log('✅ User successfully verified!')
  } catch (error) {
    console.error('Error verifying user:', error)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: tsx scripts/verify-user.ts <email>')
  process.exit(1)
}

verifyUser(email).then(() => {
  process.exit(0)
})
