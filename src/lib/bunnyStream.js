import crypto from 'crypto'

const BUNNY_API_BASE = 'https://video.bunnycdn.com'
const BUNNY_TUS_ENDPOINT = 'https://video.bunnycdn.com/tusupload'

function getBunnyConfig() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID
  const apiKey = process.env.BUNNY_STREAM_API_KEY

  if (!libraryId || !apiKey) {
    throw new Error('Bunny Stream configuration missing. Add BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY.')
  }

  return { libraryId, apiKey }
}

export function getBunnyEmbedUrl(libraryId, videoId) {
  if (!libraryId || !videoId) return ''
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`
}

export async function createBunnyVideo({ title }) {
  const { libraryId, apiKey } = getBunnyConfig()
  const res = await fetch(`${BUNNY_API_BASE}/library/${libraryId}/videos`, {
    method: 'POST',
    headers: {
      AccessKey: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || data?.Message || `Bunny video creation failed (${res.status})`)
  }

  const videoId = data.guid || data.videoId || data.id
  if (!videoId) {
    throw new Error('Bunny did not return a video ID.')
  }

  return {
    libraryId,
    videoId,
    embedUrl: getBunnyEmbedUrl(libraryId, videoId),
  }
}

export function createBunnyUploadAuth(videoId) {
  const { libraryId, apiKey } = getBunnyConfig()
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 6
  const signature = crypto
    .createHash('sha256')
    .update(`${libraryId}${apiKey}${expiresAt}${videoId}`)
    .digest('hex')

  return {
    endpoint: BUNNY_TUS_ENDPOINT,
    headers: {
      AuthorizationSignature: signature,
      AuthorizationExpire: String(expiresAt),
      VideoId: videoId,
      LibraryId: String(libraryId),
    },
  }
}

export async function deleteBunnyVideo({ libraryId, videoId }) {
  const { apiKey } = getBunnyConfig()
  if (!libraryId || !videoId) return

  const res = await fetch(`${BUNNY_API_BASE}/library/${libraryId}/videos/${videoId}`, {
    method: 'DELETE',
    headers: { AccessKey: apiKey },
  })

  if (!res.ok && res.status !== 404) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.message || data?.Message || `Bunny delete failed (${res.status})`)
  }
}
