import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import ClientGallery from '@/models/ClientGallery'
import GallerySelection from '@/models/GallerySelection'
import { verifyToken } from '@/middleware/auth'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  if (!verifyToken(request).valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    await connectDB()
    const gallery = await ClientGallery.findById(id).select('media._id media.filename').lean()
    if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const names = new Map(gallery.media.map((item) => [String(item._id), item.filename]))
    const selections = await GallerySelection.find({ galleryId: id }).sort({ updatedAt: -1 }).lean()
    return NextResponse.json(selections.map((selection) => ({
      id: String(selection._id), name: selection.name || 'Unnamed draft',
      submittedAt: selection.submittedAt, updatedAt: selection.updatedAt,
      photos: selection.mediaIds.map((mediaId) => ({ id: String(mediaId), filename: names.get(String(mediaId)) || 'Removed photo' })),
    })), { headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ error: 'Could not load selections' }, { status: 500 }) }
}
