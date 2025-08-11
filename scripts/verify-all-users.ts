import { Pool } from 'pg'

// Read environment variables directly
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/app'

async function verifyAllUsers() {
  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    console.log('Connecting to database...')

    // First, list all users
    const listResult = await pool.query(`
      SELECT id, email, username, name, email_verified, created_at
      FROM "user"
      ORDER BY created_at DESC
    `)

    console.log(`Found ${listResult.rows.length} user(s):`)
    console.log('========================')

    listResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Name: ${user.name || 'N/A'}`)
      console.log(
        `   Verified: ${user.email_verified ? user.email_verified.toISOString() : 'Not verified'}`,
      )
      console.log('------------------------')
    })

    // Update all unverified users
    const updateResult = await pool.query(`
      UPDATE "user" 
      SET email_verified = NOW() 
      WHERE email_verified IS NULL
      RETURNING id, email, email_verified
    `)

    if (updateResult.rows.length > 0) {
      console.log(`\n✅ Updated ${updateResult.rows.length} user(s):`)
      updateResult.rows.forEach((user) => {
        console.log(`- ${user.email} (${user.id})`)
      })
    } else {
      console.log('\n✅ All users are already verified!')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

verifyAllUsers().then(() => {
  console.log('\n🎉 Done!')
  process.exit(0)
})
