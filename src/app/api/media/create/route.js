import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { verifyToken } from '@/middleware/auth'

export const dynamic = 'force-dynamic'

/**
 * Create a media record when the file was already uploaded (e.g. video via direct Cloudinary).
 * Accepts JSON only — no file in request, so no payload limit issue.
 */
export async function POST(request) {
  try {
    const auth = verifyToken(request)
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error || 'Authentication required' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, category, type, cloudinaryUrl, cloudinaryPublicId, youtubeUrl = '', vimeoUrl = '', featured = false } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string' || !cloudinaryUrl.trim()) {
      return NextResponse.json({ error: 'cloudinaryUrl is required' }, { status: 400 })
    }
    if (!cloudinaryPublicId || typeof cloudinaryPublicId !== 'string' || !cloudinaryPublicId.trim()) {
      return NextResponse.json({ error: 'cloudinaryPublicId is required' }, { status: 400 })
    }

    await connectDB()

    const media = new Media({
      title: title.trim(),
      category: category || '',
      type: type || 'video',
      cloudinaryUrl: cloudinaryUrl.trim(),
      cloudinaryPublicId: cloudinaryPublicId.trim(),
      youtubeUrl: (youtubeUrl && typeof youtubeUrl === 'string') ? youtubeUrl.trim() : '',
      vimeoUrl: (vimeoUrl && typeof vimeoUrl === 'string') ? vimeoUrl.trim() : '',
      featured: !!featured,
    })

    await media.save()
    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error('Media create error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create media' },
      { status: 500 }
    )
  }
}
