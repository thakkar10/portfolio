import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ClientGallery from '@/models/ClientGallery'
import GallerySelection from '@/models/GallerySelection'
import { canViewGallery } from '@/lib/clientGallery'
import { allowGallerySelectionCreate } from '@/lib/galleryUnlockLimit'

export const dynamic = 'force-dynamic'

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex')

function publicSelection(selection) {
  return {
    id: String(selection._id), name: selection.name,
    mediaIds: selection.mediaIds.map(String), submittedAt: selection.submittedAt,
    updatedAt: selection.updatedAt,
  }
}

async function context(request, slug) {
  await connectDB()
  const gallery = await ClientGallery.findOne({ slug, status: 'published' }).select('_id status passwordHash accessVersion favoritesEnabled media._id').lean()
  if (!gallery) return { error: NextResponse.json({ error: 'Gallery not found' }, { status: 404 }) }
  if (!canViewGallery(request, gallery)) return { error: NextResponse.json({ error: 'Access required' }, { status: 401 }) }
  if (!gallery.favoritesEnabled) return { error: NextResponse.json({ error: 'Favorites are disabled' }, { status: 403 }) }
  return { gallery }
}

function validIds(ids, gallery) {
  if (!Array.isArray(ids) || ids.length > gallery.media.length || new Set(ids).size !== ids.length) return false
  const allowed = new Set(gallery.media.map((item) => String(item._id)))
  return ids.every((id) => typeof id === 'string' && allowed.has(id))
}

function selectionToken(request) {
  const token = request.headers.get('x-selection-token') || ''
  return /^[a-f0-9]{64}$/.test(token) ? token : null
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const { gallery, error } = await context(request, slug)
    if (error) return error
    const token = selectionToken(request)
    if (!token) return NextResponse.json({ error: 'Selection link required' }, { status: 400 })
    const selection = await GallerySelection.findOne({ galleryId: gallery._id, tokenHash: hash(token) }).lean()
    if (!selection) return NextResponse.json({ error: 'Selection not found', code: 'SELECTION_NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ selection: publicSelection(selection) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ error: 'Could not load selection' }, { status: 500 }) }
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params
    const { gallery, error } = await context(request, slug)
    if (error) return error
    const body = await request.json()
    if (!validIds(body.mediaIds, gallery)) return NextResponse.json({ error: 'Invalid photos' }, { status: 400 })
    if (!await allowGallerySelectionCreate(request, gallery._id)) {
      return NextResponse.json({ error: 'Too many selections. Try again later.' }, { status: 429, headers: { 'Retry-After': '900' } })
    }
    const token = crypto.randomBytes(32).toString('hex')
    const selection = await GallerySelection.create({ galleryId: gallery._id, tokenHash: hash(token), mediaIds: body.mediaIds })
    return NextResponse.json({ token, selection: publicSelection(selection) }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ error: 'Could not create selection' }, { status: 500 }) }
}

export async function PATCH(request, { params }) {
  try {
    const { slug } = await params
    const { gallery, error } = await context(request, slug)
    if (error) return error
    const token = selectionToken(request)
    if (!token) return NextResponse.json({ error: 'Selection link required' }, { status: 400 })
    const body = await request.json()
    const selection = await GallerySelection.findOne({ galleryId: gallery._id, tokenHash: hash(token) }).lean()
    if (!selection) return NextResponse.json({ error: 'Selection not found' }, { status: 404 })
    if (selection.submittedAt) return NextResponse.json({ error: 'This selection has already been sent' }, { status: 409 })
    const update = {}
    if (body.mediaIds !== undefined) {
      if (!validIds(body.mediaIds, gallery)) return NextResponse.json({ error: 'Invalid photos' }, { status: 400 })
      update.mediaIds = body.mediaIds
    }
    if (body.submit === true) {
      const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : ''
      if (!name || !(update.mediaIds || selection.mediaIds).length) return NextResponse.json({ error: 'Add a photo and your name before sending' }, { status: 400 })
      update.name = name
      update.submittedAt = new Date()
    }
    const saved = Object.keys(update).length
      ? await GallerySelection.findOneAndUpdate({ _id: selection._id, submittedAt: null }, { $set: update }, { new: true, runValidators: true })
      : selection
    if (!saved) return NextResponse.json({ error: 'This selection has already been sent' }, { status: 409 })
    return NextResponse.json({ selection: publicSelection(saved) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return NextResponse.json({ error: 'Could not save selection' }, { status: 500 }) }
}
