// Script to reset admin password
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

import connectDB from './src/lib/mongodb.js'
import User from './src/models/User.js'

// Get new password from command line argument
const newPassword = process.argv[2]

if (!newPassword) {
  console.log('\n❌ Please provide a new password as an argument')
  console.log('Usage: node reset-admin-password.js "your-new-password"\n')
  process.exit(1)
}

if (newPassword.length < 6) {
  console.log('\n❌ Password must be at least 6 characters long\n')
  process.exit(1)
}

async function resetPassword() {
  try {
    await connectDB()
    
    const user = await User.findOne({ username: 'admin' })
    
    if (!user) {
      console.log('\n❌ Admin user not found')
      process.exit(1)
    }
    
    // Set new password (will be hashed automatically by the pre-save hook)
    user.password = newPassword
    await user.save()
    
    console.log('\n✅ Password reset successfully!')
    console.log('Username: admin')
    console.log('New password:', newPassword)
    console.log('\n💡 You can now login at /admin/login\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

resetPassword()

