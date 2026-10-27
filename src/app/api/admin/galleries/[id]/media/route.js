import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import ClientGallery from '@/models/ClientGallery'
import { verifyToken } from '@/middleware/auth'
import { configureGalleryCloudinary, galleryMediaUrl } from '@/lib/clientGallery'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  if (!verifyToken(request).valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const { publicId, assetId, filename, order } = await request.json()
    if (typeof publicId !== 'string' || !publicId.startsWith(`client-galleries/${id}/`) || !/^[a-f0-9-]+$/.test(publicId.split('/').pop())) {
      return NextResponse.json({ error: 'Invalid upload' }, { status: 400 })
    }
    await connectDB()
    const gallery = await ClientGallery.findById(id).select('_id media._id media.publicId')
    if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (gallery.media.some((item) => item.publicId === publicId)) return NextResponse.json({ error: 'Already added' }, { status: 409 })
    const sdk = configureGalleryCloudinary()
    const resource = await sdk.api.resource(publicId, { resource_type: 'image', type: 'authenticated' })
    if (resource.asset_id !== assetId || resource.type !== 'authenticated' || resource.resource_type !== 'image') {
      return NextResponse.json({ error: 'Upload verification failed' }, { status: 400 })
    }
    const mediaId = new mongoose.Types.ObjectId()
    const media = {
      _id: mediaId,
      publicId, assetId, filename: typeof filename === 'string' ? filename.slice(0, 255) : 'Photo',
      format: resource.format, width: resource.width, height: resource.height,
      bytes: resource.bytes, order: Number.isInteger(order) && order >= 0 && order <= 1000000 ? order : gallery.media.length,
      set: 'Highlights',
    }
    const updated = await ClientGallery.updateOne({ _id: id, 'media.publicId': { $ne: publicId } }, { $push: { media } })
    if (!updated.modifiedCount) return NextResponse.json({ error: 'Already added' }, { status: 409 })
    await ClientGallery.updateOne({ _id: id, coverMediaId: null }, { $set: { coverMediaId: mediaId } })
    return NextResponse.json({
      ok: true,
      media: {
        id: String(mediaId), filename: media.filename, width: media.width, height: media.height,
        bytes: media.bytes, set: media.set, order: media.order,
        thumbUrl: galleryMediaUrl(publicId), fullUrl: galleryMediaUrl(publicId, 'full'),
      },
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
