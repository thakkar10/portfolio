// Script to check existing admin users in the database
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

import connectDB from './src/lib/mongodb.js'
import User from './src/models/User.js'

async function checkUsers() {
  try {
    await connectDB()
    const users = await User.find({}).select('username createdAt -_id')
    
    console.log('\n📋 Existing Admin Users:')
    console.log('='.repeat(40))
    
    if (users.length === 0) {
      console.log('❌ No users found in database')
      console.log('\n💡 You need to create an admin account first!')
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`)
        console.log(`   Created: ${user.createdAt}`)
      })
    }
    
    console.log('\n💡 Note: Passwords are hashed and cannot be retrieved.')
    console.log('   If you forgot your password, create a new account or reset it.\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkUsers()

