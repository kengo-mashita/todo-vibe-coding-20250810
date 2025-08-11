import { config } from 'dotenv'
config({ path: '.env' })

import { db } from '../src/db'
import { users } from '../src/db/schema'

async function listUsers() {
  try {
    console.log('Fetching all users...')

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        name: users.name,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      })
      .from(users)

    if (allUsers.length === 0) {
      console.log('No users found in the database')
      return
    }

    console.log(`Found ${allUsers.length} user(s):`)
    console.log('========================')

    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Name: ${user.name || 'N/A'}`)
      console.log(
        `   Email Verified: ${user.emailVerified ? user.emailVerified.toISOString() : 'Not verified'}`,
      )
      console.log(`   Created: ${user.createdAt.toISOString()}`)
      console.log('------------------------')
    })
  } catch (error) {
    console.error('Error listing users:', error)
  }
}

listUsers().then(() => {
  process.exit(0)
})
