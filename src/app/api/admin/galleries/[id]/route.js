import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import ClientGallery from '@/models/ClientGallery'
import { verifyToken } from '@/middleware/auth'
import { galleryMediaUrl } from '@/lib/clientGallery'

export const dynamic = 'force-dynamic'

function unauthorized(request) { return !verifyToken(request).valid }

export async function GET(request, { params }) {
  if (unauthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    await connectDB()
    const gallery = await ClientGallery.findById(id).lean()
    if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      id: String(gallery._id), title: gallery.title, slug: gallery.slug, status: gallery.status,
      eventDate: gallery.eventDate, description: gallery.description,
      coverMediaId: gallery.coverMediaId ? String(gallery.coverMediaId) : null,
      coverFocusX: gallery.coverFocusX, coverFocusY: gallery.coverFocusY,
      hasPassword: Boolean(gallery.passwordHash), downloadsEnabled: gallery.downloadsEnabled,
      favoritesEnabled: gallery.favoritesEnabled,
      media: gallery.media.sort((a, b) => a.order - b.order).map((item) => ({
        id: String(item._id), filename: item.filename, width: item.width, height: item.height,
        bytes: item.bytes, set: item.set, order: item.order,
        thumbUrl: galleryMediaUrl(item.publicId), fullUrl: galleryMediaUrl(item.publicId, 'full'),
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  if (unauthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const body = await request.json()
    await connectDB()
    const gallery = await ClientGallery.findById(id)
    if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (typeof body.title === 'string') gallery.title = body.title.trim().slice(0, 150) || 'Untitled gallery'
    if (typeof body.description === 'string') gallery.description = body.description.trim().slice(0, 2000)
    if (body.eventDate !== undefined) gallery.eventDate = body.eventDate ? new Date(body.eventDate) : null
    if (typeof body.downloadsEnabled === 'boolean') gallery.downloadsEnabled = body.downloadsEnabled
    if (typeof body.favoritesEnabled === 'boolean') gallery.favoritesEnabled = body.favoritesEnabled
    if (Number.isFinite(body.coverFocusX)) gallery.coverFocusX = Math.max(0, Math.min(100, body.coverFocusX))
    if (Number.isFinite(body.coverFocusY)) gallery.coverFocusY = Math.max(0, Math.min(100, body.coverFocusY))
    if (body.coverMediaId !== undefined) {
      if (body.coverMediaId && !gallery.media.some((item) => String(item._id) === body.coverMediaId)) {
        return NextResponse.json({ error: 'Cover photo is not in this gallery' }, { status: 400 })
      }
      gallery.coverMediaId = body.coverMediaId || null
    }
    if (body.password !== undefined) {
      if (typeof body.password !== 'string' || body.password.length > 100) return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
      gallery.passwordHash = body.password ? await bcrypt.hash(body.password, 12) : ''
      gallery.accessVersion += 1
    }
    if (Array.isArray(body.mediaOrder)) {
      const ids = gallery.media.map((item) => String(item._id))
      if (body.mediaOrder.length !== ids.length || new Set(body.mediaOrder).size !== ids.length || body.mediaOrder.some((item) => !ids.includes(item))) {
        return NextResponse.json({ error: 'Invalid media order' }, { status: 400 })
      }
      for (const item of gallery.media) item.order = body.mediaOrder.indexOf(String(item._id))
    }
    if (body.mediaSets && typeof body.mediaSets === 'object') {
      for (const item of gallery.media) {
        const set = body.mediaSets[String(item._id)]
        if (typeof set === 'string') item.set = set.trim().slice(0, 60) || 'Highlights'
      }
    }
    if (body.status !== undefined) {
      if (!['draft', 'published'].includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      if (body.status === 'published' && !gallery.media.length) return NextResponse.json({ error: 'Upload a photo before publishing' }, { status: 400 })
      gallery.status = body.status
    }
    await gallery.save()
    return NextResponse.json({ ok: true, status: gallery.status })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
