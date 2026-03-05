import { NextResponse } from 'next/server'
import { verifyToken } from '@/middleware/auth'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'

/**
 * Returns signed Cloudinary upload params for client-side (browser) uploads.
 * Use for videos (and optionally large files) so the file never hits Vercel's 4.5 MB limit.
 */
export async function GET(request) {
  try {
    const auth = verifyToken(request)
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error || 'Authentication required' }, { status: 401 })
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary environment variables are not set' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resource_type') || 'video'
    const folder = searchParams.get('folder') || 'portfolio'

    if (!['video', 'image', 'raw'].includes(resourceType)) {
      return NextResponse.json({ error: 'Invalid resource_type' }, { status: 400 })
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const paramsToSign = { timestamp, folder, resource_type: resourceType }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

    return NextResponse.json({
      cloud_name: cloudName,
      api_key: apiKey,
      timestamp,
      signature,
      folder,
      resource_type: resourceType,
    })
  } catch (error) {
    console.error('Cloudinary upload params error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate upload params' },
      { status: 500 }
    )
  }
}
