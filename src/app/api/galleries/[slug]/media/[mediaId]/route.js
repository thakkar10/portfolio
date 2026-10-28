import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClientGallery from '@/models/ClientGallery'
import { canViewGallery, configureGalleryCloudinary, galleryMediaUrl } from '@/lib/clientGallery'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { slug, mediaId } = await params
  try {
    await connectDB()
    const gallery = await ClientGallery.findOne({ slug, status: 'published' }).lean()
    if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    if (!canViewGallery(request, gallery)) return NextResponse.json({ error: 'Access required' }, { status: 401 })
    const item = gallery.media.find((media) => String(media._id) === mediaId)
    if (!item) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    const { searchParams } = new URL(request.url)
    const variant = searchParams.get('variant') === 'full' ? 'full' : 'thumb'
    if (searchParams.get('download') === '1') {
      if (!gallery.downloadsEnabled) return NextResponse.json({ error: 'Downloads are disabled' }, { status: 403 })
      const sdk = configureGalleryCloudinary()
      const url = sdk.utils.private_download_url(item.publicId, item.format, {
        resource_type: 'image', type: 'authenticated', expires_at: Math.floor(Date.now() / 1000) + 60,
      })
      return NextResponse.redirect(url, { headers: { 'Cache-Control': 'no-store' } })
    }
    const cloudinaryResponse = await fetch(galleryMediaUrl(item.publicId, variant), { cache: 'no-store' })
    if (!cloudinaryResponse.ok) return NextResponse.json({ error: 'Photo is unavailable' }, { status: 502 })
    return new NextResponse(cloudinaryResponse.body, {
      headers: {
        'Content-Type': cloudinaryResponse.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Could not load photo' }, { status: 500 })
  }
}
