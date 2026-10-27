import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClientGallery from '@/models/ClientGallery'
import { canViewGallery, publicGalleryData } from '@/lib/clientGallery'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { slug } = await params
  try {
    await connectDB()
    const gallery = await ClientGallery.findOne({ slug, status: 'published' }).lean()
    if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    if (!canViewGallery(request, gallery)) {
      return NextResponse.json({ locked: true, title: gallery.title, slug: gallery.slug }, { headers: { 'Cache-Control': 'no-store' } })
    }
    return NextResponse.json({ locked: false, gallery: publicGalleryData(gallery) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
