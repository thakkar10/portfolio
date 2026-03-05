import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'

// Mark as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET() {
  const hasUri = !!(
    process.env.MONGODB_URI &&
    process.env.MONGODB_URI.trim() &&
    (process.env.MONGODB_URI.startsWith('mongodb://') || process.env.MONGODB_URI.startsWith('mongodb+srv://'))
  )
  const hasDbInUri = hasUri && /\.mongodb\.net\/[^/?]/.test(process.env.MONGODB_URI)

  try {
    if (!hasUri) {
      return NextResponse.json(
        {
          success: false,
          error: 'MONGODB_URI not set or invalid',
          hint: 'Add MONGODB_URI in Vercel → Settings → Environment Variables, then redeploy. Use the same value as in .env.local (must include /portfolio before the ?).',
        },
        { status: 500 }
      )
    }
    if (!hasDbInUri) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database name missing in MONGODB_URI',
          hint: 'Your URI should end with ...mongodb.net/portfolio?retryWrites=... (include /portfolio before the ?).',
        },
        { status: 500 }
      )
    }

    await connectDB()

    const totalCount = await Media.countDocuments({})
    const allMedia = await Media.find({}).limit(5).select('title type cloudinaryUrl featured createdAt')

    return NextResponse.json({
      success: true,
      message: 'Backend connected. MongoDB is reachable.',
      stats: {
        totalMedia: totalCount,
        sampleMedia: allMedia,
      },
    })
  } catch (error) {
    const hint = error.message.includes('whitelist') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')
      ? 'MongoDB Atlas: 1) Cluster must be running (not paused). 2) Network Access → allow 0.0.0.0/0 or add Vercel IPs. 3) Database Access user/password must match MONGODB_URI.'
      : 'Check MONGODB_URI in Vercel (same as .env.local, with /portfolio in the path). Redeploy after changing env vars.'
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint,
      },
      { status: 500 }
    )
  }
}

