/* global process */
import crypto from 'node:crypto'
import GalleryUnlockAttempt from '@/models/GalleryUnlockAttempt'

const WINDOW_MS = 15 * 60 * 1000

function clientHash(request) {
  // A custom header is safe only when the deployment ingress strips or overwrites client-supplied values.
  const header = process.env.VERCEL === '1' ? 'x-vercel-forwarded-for' : process.env.GALLERY_TRUSTED_CLIENT_IP_HEADER
  const ip = header ? (request.headers.get(header) || 'unknown').split(',')[0].trim() : 'unknown'
  return crypto.createHash('sha256').update(ip).digest('hex')
}

async function consume(key, limit, now) {
  const cutoff = new Date(now.getTime() - WINDOW_MS)
  const recent = { $filter: { input: { $ifNull: ['$attempts', []] }, as: 'attempt', cond: { $gte: ['$$attempt', cutoff] } } }
  const attempt = await GalleryUnlockAttempt.findOneAndUpdate(
    { _id: key },
    [{ $set: {
      attempts: { $slice: [{ $concatArrays: [recent, [now]] }, -(limit + 1)] },
      expiresAt: new Date(now.getTime() + WINDOW_MS),
    } }],
    { upsert: true, new: true },
  ).lean()
  return attempt.attempts.length <= limit
}

export async function allowGalleryUnlock(request, galleryId) {
  const ipHash = clientHash(request)
  const now = new Date()
  const perClient = await consume(`gallery:${galleryId}:ip:${ipHash}`, 10, now)
  if (!perClient) return false
  return consume(`gallery:${galleryId}:all`, 100, now)
}

export async function allowGallerySelectionCreate(request, galleryId) {
  const ipHash = clientHash(request)
  const now = new Date()
  const perClient = await consume(`selection:${galleryId}:ip:${ipHash}`, 10, now)
  if (!perClient) return false
  return consume(`selection:${galleryId}:all`, 100, now)
}
