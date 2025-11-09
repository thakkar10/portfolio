import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { verifyToken } from '@/middleware/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request) {
  try {
    const auth = verifyToken(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    await connectDB()
    const formData = await request.formData()
    const file = formData.get('file')
    const title = formData.get('title')
    const category = formData.get('category')
    const type = formData.get('type') || 'image'
    const youtubeUrl = formData.get('youtubeUrl') || ''
    const vimeoUrl = formData.get('vimeoUrl') || ''
    const featured = formData.get('featured') === 'true'

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    let cloudinaryUrl = ''
    let cloudinaryPublicId = ''

    // Upload to Cloudinary if file provided
    if (file && file.size > 0) {
      try {
        const result = await uploadToCloudinary(file)
        cloudinaryUrl = result.secure_url
        cloudinaryPublicId = result.public_id
      } catch (error) {
        console.error('Cloudinary upload error:', error)
        return NextResponse.json(
          { error: 'Failed to upload file' },
          { status: 500 }
        )
      }
    }

    const media = new Media({
      title,
      category,
      type,
      cloudinaryUrl,
      cloudinaryPublicId,
      youtubeUrl,
      vimeoUrl,
      featured,
    })

    await media.save()
    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

