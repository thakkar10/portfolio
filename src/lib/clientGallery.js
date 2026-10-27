/* global process */
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'

export function configureGalleryCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary is not configured')
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  return cloudinary
}

export function newGallerySlug() {
  return `gallery-${crypto.randomBytes(8).toString('hex')}`
}

export function galleryCookieName(id) {
  return `gallery_access_${id}`
}

function accessSecret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required for client galleries')
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update('client-gallery-access-v1').digest('hex')
}

export function createGalleryAccessToken(gallery) {
  return jwt.sign({ galleryId: String(gallery._id), accessVersion: gallery.accessVersion }, accessSecret(), { expiresIn: '7d', audience: 'client-gallery' })
}

export function canViewGallery(request, gallery) {
  if (gallery.status !== 'published') return false
  if (!gallery.passwordHash) return true
  const token = request.cookies.get(galleryCookieName(gallery._id))?.value
  if (!token) return false
  try {
    const payload = jwt.verify(token, accessSecret(), { audience: 'client-gallery' })
    return payload.galleryId === String(gallery._id) && payload.accessVersion === gallery.accessVersion
  } catch {
    return false
  }
}

export function galleryMediaUrl(publicId, variant = 'thumb') {
  const sdk = configureGalleryCloudinary()
  const transformation = variant === 'full'
    ? [{ width: 2200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
    : [{ width: 900, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
  return sdk.url(publicId, { resource_type: 'image', type: 'authenticated', sign_url: true, secure: true, transformation })
}

export function publicGalleryData(gallery) {
  return {
    id: String(gallery._id),
    title: gallery.title,
    slug: gallery.slug,
    description: gallery.description,
    eventDate: gallery.eventDate,
    coverMediaId: gallery.coverMediaId ? String(gallery.coverMediaId) : null,
    coverFocusX: gallery.coverFocusX,
    coverFocusY: gallery.coverFocusY,
    downloadsEnabled: gallery.downloadsEnabled,
    favoritesEnabled: gallery.favoritesEnabled,
    media: gallery.media.sort((a, b) => a.order - b.order).map((item) => ({
      id: String(item._id), filename: item.filename, width: item.width, height: item.height, set: item.set,
    })),
  }
}
