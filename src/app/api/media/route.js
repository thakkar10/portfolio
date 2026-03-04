import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'

// Mark as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    console.log('🔍 Fetching media...')
    await connectDB()
    console.log('✅ Database connected')
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    let query = {}
    if (type) query.type = type
    if (category) query.category = category
    if (featured === 'true') query.featured = true

    console.log('📋 Media query:', JSON.stringify(query))
    
    // Check total count first
    const totalCount = await Media.countDocuments({})
    console.log(`📊 Total media items in database: ${totalCount}`)
    
    let mediaQuery = Media.find(query).sort({ order: 1, createdAt: -1 })
    if (limit) mediaQuery = mediaQuery.limit(parseInt(limit))

    const media = await mediaQuery
    console.log(`✅ Found ${media.length} media items matching query`)
    
    if (media.length > 0) {
      console.log('📸 Sample media item:', {
        id: media[0]._id,
        title: media[0].title,
        type: media[0].type,
        hasUrl: !!media[0].cloudinaryUrl
      })
    }
    
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(media) ? media : [])
  } catch (error) {
    console.error('❌ Error fetching media:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    // Return 500 so frontend can show error (e.g. missing MONGODB_URI on Vercel)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

