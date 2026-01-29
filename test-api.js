// Script to test if the API can fetch images from the database
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

import connectDB from './src/lib/mongodb.js'
import Media from './src/models/Media.js'

async function testAPI() {
  try {
    console.log('\n🔍 Testing database connection and media fetch...\n')
    
    // Check environment variables
    console.log('📋 Environment Variables:')
    console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing')
    console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing')
    console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing')
    console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing')
    console.log('')
    
    // Connect to database
    console.log('🔌 Connecting to MongoDB...')
    await connectDB()
    console.log('✅ Database connected\n')
    
    // Count all media
    const totalCount = await Media.countDocuments({})
    console.log(`📊 Total media items in database: ${totalCount}`)
    
    // Count featured media
    const featuredCount = await Media.countDocuments({ featured: true })
    console.log(`⭐ Featured media items: ${featuredCount}`)
    
    // Get sample media
    const sampleMedia = await Media.find({}).limit(5)
    console.log(`\n📸 Sample media items (first 5):`)
    sampleMedia.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title || 'Untitled'}`)
      console.log(`     Type: ${item.type}`)
      console.log(`     Category: ${item.category || 'N/A'}`)
      console.log(`     Featured: ${item.featured ? 'Yes' : 'No'}`)
      console.log(`     Has Cloudinary URL: ${item.cloudinaryUrl ? '✅' : '❌'}`)
      if (item.cloudinaryUrl) {
        console.log(`     URL: ${item.cloudinaryUrl.substring(0, 60)}...`)
      }
      console.log('')
    })
    
    // Test featured query (what homepage uses)
    const featuredMedia = await Media.find({ featured: true }).limit(10)
    console.log(`\n🏠 Featured media for homepage: ${featuredMedia.length} items`)
    
    if (totalCount === 0) {
      console.log('\n⚠️  WARNING: No media items found in database!')
      console.log('   You need to upload images through the admin dashboard.')
    } else if (featuredCount === 0) {
      console.log('\n⚠️  WARNING: No featured media items found!')
      console.log('   The homepage looks for featured=true items.')
      console.log('   Make sure to mark images as "featured" when uploading.')
    } else {
      console.log('\n✅ Database looks good! Images should be visible.')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('❌ Stack:', error.stack)
    process.exit(1)
  }
}

testAPI()

