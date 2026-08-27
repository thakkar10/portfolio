import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { verifyToken } from '@/middleware/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { generateMediaSummary } from '@/lib/mediaSummary'

// Mark as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    console.log('📤 Upload request received')
    
    const auth = verifyToken(request)
    if (!auth.valid) {
      console.error('❌ Authentication failed:', auth.error)
      return NextResponse.json(
        { error: auth.error || 'Authentication failed' },
        { status: 401 }
      )
    }
    console.log('✅ Authentication successful')

    await connectDB()
    console.log('✅ Database connected')
    
    const formData = await request.formData()
    const file = formData.get('file')
    const title = formData.get('title')
    const category = formData.get('category')
    const type = formData.get('type') || 'image'
    const youtubeUrl = formData.get('youtubeUrl') || ''
    const vimeoUrl = formData.get('vimeoUrl') || ''
    const featured = formData.get('featured') === 'true'
    const cloudinaryUrlFromClient = formData.get('cloudinaryUrl')
    const cloudinaryPublicIdFromClient = formData.get('cloudinaryPublicId')
    const thumbnailUrlFromClient = formData.get('thumbnailUrl')
    const thumbnailPublicIdFromClient = formData.get('thumbnailPublicId')
    const captionFromClient = formData.get('caption')

    console.log('📋 Form data:', { title, category, type, hasFile: !!file, fileSize: file?.size, hasDirectUrl: !!cloudinaryUrlFromClient })

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary environment variables missing')
      return NextResponse.json(
        { error: 'Cloudinary configuration missing. Please check environment variables.' },
        { status: 500 }
      )
    }

    let cloudinaryUrl = ''
    let cloudinaryPublicId = ''

    // Use URL/publicId from client when video (or large file) was uploaded directly to Cloudinary
    if (cloudinaryUrlFromClient && typeof cloudinaryUrlFromClient === 'string' && cloudinaryPublicIdFromClient && typeof cloudinaryPublicIdFromClient === 'string') {
      cloudinaryUrl = cloudinaryUrlFromClient.trim()
      cloudinaryPublicId = cloudinaryPublicIdFromClient.trim()
      console.log('✅ Using client-uploaded Cloudinary asset:', cloudinaryUrl.substring(0, 60) + '...')
    }
    // Otherwise upload file to Cloudinary if provided
    else if (file && file.size > 0) {
      try {
        console.log('☁️ Uploading to Cloudinary...', { size: file.size, type: file.type })
        const result = await uploadToCloudinary(file)
        cloudinaryUrl = result.secure_url
        cloudinaryPublicId = result.public_id
        console.log('✅ Cloudinary upload successful:', cloudinaryUrl)
      } catch (error) {
        console.error('❌ Cloudinary upload error:', error)
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        return NextResponse.json(
          { error: `Failed to upload file: ${error.message}` },
          { status: 500 }
        )
      }
    }

    const caption = captionFromClient
      ? String(captionFromClient).trim()
      : await generateMediaSummary({
        title,
        category,
        type,
        cloudinaryUrl,
      })

    const media = new Media({
      title,
      category,
      type,
      cloudinaryUrl,
      cloudinaryPublicId,
      thumbnailUrl: thumbnailUrlFromClient && typeof thumbnailUrlFromClient === 'string' ? thumbnailUrlFromClient.trim() : '',
      thumbnailPublicId: thumbnailPublicIdFromClient && typeof thumbnailPublicIdFromClient === 'string' ? thumbnailPublicIdFromClient.trim() : '',
      youtubeUrl,
      vimeoUrl,
      featured,
      caption,
    })

    await media.save()
    console.log('✅ Media saved to database:', media._id)
    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error('❌ Upload error:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: error.message || 'An error occurred during upload' },
      { status: 500 }
    )
  }
}
