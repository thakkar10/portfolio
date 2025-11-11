import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'

export const dynamic = 'force-dynamic'

function extractKeywords(query) {
  if (!query) return []
  const q = query.toLowerCase()
  // very simple keyword normalization
  const synonyms = {
    travel: ['travel', 'trip', 'journey', 'vacation', 'wander', 'wanderlust'],
    portrait: ['portrait', 'portraits', 'headshot', 'people', 'person'],
    nature: ['nature', 'forest', 'trees', 'mountain', 'landscape'],
    street: ['street', 'urban', 'city', 'downtown'],
    design: ['design', 'graphic', 'poster', 'branding'],
    video: ['video', 'film', 'cinematic'],
    image: ['photo', 'image', 'picture'],
  }
  const tokens = q.split(/[^a-z0-9]+/).filter(Boolean)
  const expanded = new Set(tokens)
  for (const [key, list] of Object.entries(synonyms)) {
    if (tokens.some(t => t === key || list.includes(t))) {
      list.forEach(w => expanded.add(w))
    }
  }
  return Array.from(expanded)
}

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') // optional filter
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 60)

    const keywords = extractKeywords(q)

    // Build query: prefer text search if any query, else fallback to filters
    const filters = {}
    if (type) filters.type = type

    let mongoQuery = []

    if (q.trim().length > 0) {
      mongoQuery.push({ $text: { $search: q } })
      if (keywords.length > 0) {
        mongoQuery.push({
          $or: [
            { tags: { $in: keywords } },
            { category: { $in: keywords } },
            { title: { $regex: keywords.join('|'), $options: 'i' } },
          ],
        })
      }
    }

    const finalQuery = mongoQuery.length > 0
      ? { $and: [filters, { $or: mongoQuery }] }
      : filters

    let cursor = Media.find(finalQuery)
      .sort(q ? { score: { $meta: 'textScore' }, order: 1, createdAt: -1 } : { order: 1, createdAt: -1 })
      .limit(limit)

    if (q) cursor = cursor.select({ score: { $meta: 'textScore' } })

    const results = await cursor

    return NextResponse.json(Array.isArray(results) ? results : [])
  } catch (error) {
    console.error('Search error:', error)
    // Return empty array on error to avoid frontend crashes
    return NextResponse.json([], { status: 200 })
  }
}
