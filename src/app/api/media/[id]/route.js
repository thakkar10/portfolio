import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { verifyToken } from '@/middleware/auth'
import cloudinary from '@/lib/cloudinary'
import { deleteBunnyVideo } from '@/lib/bunnyStream'

// Mark as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function PUT(request, { params }) {
  try {
    const auth = verifyToken(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    await connectDB()
    const { id } = await params
    const body = await request.json()

    const updates = {}
    if (body.title !== undefined) updates.title = body.title
    if (body.category !== undefined) updates.category = body.category
    if (body.featured !== undefined) updates.featured = body.featured
    if (body.order !== undefined) updates.order = body.order
    if (body.thumbnailUrl !== undefined) updates.thumbnailUrl = body.thumbnailUrl
    if (body.thumbnailPublicId !== undefined) updates.thumbnailPublicId = body.thumbnailPublicId

    const existingMedia = await Media.findById(id)

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    const media = await Media.findByIdAndUpdate(id, updates, { new: true })

    if (
      updates.thumbnailPublicId &&
      existingMedia.thumbnailPublicId &&
      updates.thumbnailPublicId !== existingMedia.thumbnailPublicId
    ) {
      try {
        await cloudinary.uploader.destroy(existingMedia.thumbnailPublicId)
      } catch (error) {
        console.error('Cloudinary thumbnail delete error:', error)
      }
    }

    return NextResponse.json(media)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = verifyToken(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    await connectDB()
    const { id } = await params
    const media = await Media.findById(id)

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Delete from Cloudinary if exists
    if (media.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(media.cloudinaryPublicId)
      } catch (error) {
        console.error('Cloudinary delete error:', error)
      }
    }

    if (media.thumbnailPublicId) {
      try {
        await cloudinary.uploader.destroy(media.thumbnailPublicId)
      } catch (error) {
        console.error('Cloudinary thumbnail delete error:', error)
      }
    }

    if (media.bunnyVideoId && media.bunnyLibraryId) {
      try {
        await deleteBunnyVideo({
          libraryId: media.bunnyLibraryId,
          videoId: media.bunnyVideoId,
        })
      } catch (error) {
        console.error('Bunny Stream delete error:', error)
      }
    }

    await Media.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
