import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { verifyToken } from '@/middleware/auth'
import AboutContent from '@/models/AboutContent'

export const dynamic = 'force-dynamic'

export const defaultAboutContent = {
  body: `His work is built around the tension between structure and instinct:
composing with technical precision, then leaving enough space for a
frame to feel human. Across quiet landscapes, candid street moments,
portraits, and cinematic sequences, the goal is the same: create images
that feel intentional without losing their pulse.

A background in computer science and design informs the way he thinks
about systems, pacing, interaction, and presentation. The result is a
creative practice that treats each photograph, film, and digital surface
as part of a larger visual language.`,
  primaryImageUrl: '/me.jpg',
  primaryImagePublicId: '',
  secondaryImageUrl: '/me2.jpg',
  secondaryImagePublicId: '',
}

function serializeAboutContent(content) {
  return {
    body: content?.body || defaultAboutContent.body,
    primaryImageUrl: content?.primaryImageUrl || defaultAboutContent.primaryImageUrl,
    primaryImagePublicId: content?.primaryImagePublicId || '',
    secondaryImageUrl: content?.secondaryImageUrl || defaultAboutContent.secondaryImageUrl,
    secondaryImagePublicId: content?.secondaryImagePublicId || '',
  }
}

async function getAboutDocument() {
  await connectDB()
  return AboutContent.findOne({ key: 'about' })
}

export async function GET() {
  try {
    const content = await getAboutDocument()
    return NextResponse.json(serializeAboutContent(content))
  } catch (error) {
    console.error('About content fetch error:', error)
    return NextResponse.json(defaultAboutContent)
  }
}

export async function PUT(request) {
  try {
    const auth = verifyToken(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      )
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary configuration missing. Please check environment variables.' },
        { status: 500 }
      )
    }

    await connectDB()

    const formData = await request.formData()
    const body = String(formData.get('body') || '').trim()
    const primaryImage = formData.get('primaryImage')
    const secondaryImage = formData.get('secondaryImage')
    const existingPrimaryImageUrl = String(formData.get('primaryImageUrl') || '').trim()
    const existingPrimaryImagePublicId = String(formData.get('primaryImagePublicId') || '').trim()
    const existingSecondaryImageUrl = String(formData.get('secondaryImageUrl') || '').trim()
    const existingSecondaryImagePublicId = String(formData.get('secondaryImagePublicId') || '').trim()

    if (!body) {
      return NextResponse.json(
        { error: 'About paragraph is required' },
        { status: 400 }
      )
    }

    const update = {
      key: 'about',
      body,
      primaryImageUrl: existingPrimaryImageUrl || defaultAboutContent.primaryImageUrl,
      primaryImagePublicId: existingPrimaryImagePublicId,
      secondaryImageUrl: existingSecondaryImageUrl || defaultAboutContent.secondaryImageUrl,
      secondaryImagePublicId: existingSecondaryImagePublicId,
    }

    if (primaryImage && primaryImage.size > 0) {
      const result = await uploadToCloudinary(primaryImage, 'portfolio/about')
      update.primaryImageUrl = result.secure_url
      update.primaryImagePublicId = result.public_id
    }

    if (secondaryImage && secondaryImage.size > 0) {
      const result = await uploadToCloudinary(secondaryImage, 'portfolio/about')
      update.secondaryImageUrl = result.secure_url
      update.secondaryImagePublicId = result.public_id
    }

    const content = await AboutContent.findOneAndUpdate(
      { key: 'about' },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    return NextResponse.json(serializeAboutContent(content))
  } catch (error) {
    console.error('About content update error:', error)
    return NextResponse.json(
      { error: error.message || 'Could not update about content' },
      { status: 500 }
    )
  }
}
