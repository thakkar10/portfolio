/* global process */
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import ClientGallery from '@/models/ClientGallery'
import { createGalleryAccessToken, galleryCookieName } from '@/lib/clientGallery'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  const { slug } = await params
  try {
    const { password } = await request.json()
    await connectDB()
    const gallery = await ClientGallery.findOne({ slug, status: 'published' })
    if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    if (!gallery.passwordHash || typeof password !== 'string' || !await bcrypt.compare(password, gallery.passwordHash)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }
    const response = NextResponse.json({ ok: true })
    response.cookies.set(galleryCookieName(gallery._id), createGalleryAccessToken(gallery), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
      path: `/api/galleries/${slug}`, maxAge: 7 * 24 * 60 * 60,
    })
    return response
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
