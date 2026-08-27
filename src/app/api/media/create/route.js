import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { verifyToken } from '@/middleware/auth'
import { generateMediaSummary } from '@/lib/mediaSummary'

export const dynamic = 'force-dynamic'

/**
 * Create a media record when the file was already uploaded (e.g. video via Bunny Stream).
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
    const {
      title,
      category,
      type,
      cloudinaryUrl = '',
      cloudinaryPublicId = '',
      bunnyLibraryId = '',
      bunnyVideoId = '',
      bunnyEmbedUrl = '',
      thumbnailUrl = '',
      thumbnailPublicId = '',
      youtubeUrl = '',
      vimeoUrl = '',
      featured = false,
      caption = '',
    } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    const mediaType = type || 'video'
    const hasCloudinaryAsset = cloudinaryUrl && typeof cloudinaryUrl === 'string' && cloudinaryUrl.trim()
    const hasBunnyAsset = bunnyVideoId && typeof bunnyVideoId === 'string' && bunnyVideoId.trim()
    const hasExternalVideo = youtubeUrl || vimeoUrl

    if (mediaType === 'image' && !hasCloudinaryAsset) {
      return NextResponse.json({ error: 'cloudinaryUrl is required for images' }, { status: 400 })
    }
    if (mediaType === 'video' && !hasBunnyAsset && !hasCloudinaryAsset && !hasExternalVideo) {
      return NextResponse.json({ error: 'A Bunny, Cloudinary, YouTube, or Vimeo video source is required' }, { status: 400 })
    }

    await connectDB()

    const mediaCaption = (caption && typeof caption === 'string')
      ? caption.trim()
      : await generateMediaSummary({
        title: title.trim(),
        category,
        type: mediaType,
        cloudinaryUrl: hasCloudinaryAsset ? cloudinaryUrl.trim() : '',
      })

    const media = new Media({
      title: title.trim(),
      category: category || '',
      type: mediaType,
      cloudinaryUrl: hasCloudinaryAsset ? cloudinaryUrl.trim() : '',
      cloudinaryPublicId: (cloudinaryPublicId && typeof cloudinaryPublicId === 'string') ? cloudinaryPublicId.trim() : '',
      bunnyLibraryId: (bunnyLibraryId && typeof bunnyLibraryId === 'string') ? bunnyLibraryId.trim() : '',
      bunnyVideoId: hasBunnyAsset ? bunnyVideoId.trim() : '',
      bunnyEmbedUrl: (bunnyEmbedUrl && typeof bunnyEmbedUrl === 'string') ? bunnyEmbedUrl.trim() : '',
      thumbnailUrl: (thumbnailUrl && typeof thumbnailUrl === 'string') ? thumbnailUrl.trim() : '',
      thumbnailPublicId: (thumbnailPublicId && typeof thumbnailPublicId === 'string') ? thumbnailPublicId.trim() : '',
      youtubeUrl: (youtubeUrl && typeof youtubeUrl === 'string') ? youtubeUrl.trim() : '',
      vimeoUrl: (vimeoUrl && typeof vimeoUrl === 'string') ? vimeoUrl.trim() : '',
      featured: !!featured,
      caption: mediaCaption,
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
