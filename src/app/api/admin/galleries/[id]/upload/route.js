/* global process */
import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import ClientGallery from '@/models/ClientGallery'
import { verifyToken } from '@/middleware/auth'
import { configureGalleryCloudinary } from '@/lib/clientGallery'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  if (!verifyToken(request).valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    await connectDB()
    const gallery = await ClientGallery.findById(id).select('_id')
    if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const sdk = configureGalleryCloudinary()
    const publicId = `client-galleries/${id}/${crypto.randomUUID()}`
    const timestamp = Math.floor(Date.now() / 1000)
    const type = 'authenticated'
    const signature = sdk.utils.api_sign_request({ public_id: publicId, timestamp, type }, process.env.CLOUDINARY_API_SECRET)
    return NextResponse.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY,
      publicId, timestamp, type, signature,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
