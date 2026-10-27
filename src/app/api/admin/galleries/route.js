import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClientGallery from '@/models/ClientGallery'
import { verifyToken } from '@/middleware/auth'
import { newGallerySlug } from '@/lib/clientGallery'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  if (!verifyToken(request).valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const galleries = await ClientGallery.find({}).select('title slug status coverMediaId media filename updatedAt').sort({ updatedAt: -1 }).lean()
    return NextResponse.json(galleries.map((gallery) => ({
      id: String(gallery._id), title: gallery.title, slug: gallery.slug, status: gallery.status,
      photoCount: gallery.media.length, updatedAt: gallery.updatedAt,
    })))
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  if (!verifyToken(request).valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 150) : ''
    await connectDB()
    const gallery = await ClientGallery.create({ slug: newGallerySlug(), title: title || 'Untitled gallery' })
    return NextResponse.json({ id: String(gallery._id), slug: gallery.slug }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
