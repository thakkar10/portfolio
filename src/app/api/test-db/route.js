import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'

export async function GET() {
  try {
    await connectDB()
    
    // Check database stats
    const totalCount = await Media.countDocuments({})
    const allMedia = await Media.find({}).limit(5).select('title type cloudinaryUrl featured createdAt')
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connected successfully!',
      stats: {
        totalMedia: totalCount,
        sampleMedia: allMedia
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.message.includes('whitelist') 
          ? 'Your IP address is not whitelisted in MongoDB Atlas. Go to MongoDB Atlas → Network Access → Add IP Address (or use 0.0.0.0/0 for development)'
          : 'Check your MONGODB_URI in .env.local'
      },
      { status: 500 }
    )
  }
}

