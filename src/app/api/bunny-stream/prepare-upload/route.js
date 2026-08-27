import { NextResponse } from 'next/server'
import { verifyToken } from '@/middleware/auth'
import { createBunnyUploadAuth, createBunnyVideo } from '@/lib/bunnyStream'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const auth = verifyToken(request)
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error || 'Authentication required' }, { status: 401 })
    }

    const { title } = await request.json()
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const video = await createBunnyVideo({ title: title.trim() })
    const upload = createBunnyUploadAuth(video.videoId)

    return NextResponse.json({
      ...video,
      upload,
    })
  } catch (error) {
    console.error('Bunny prepare upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to prepare Bunny Stream upload' },
      { status: 500 }
    )
  }
}
