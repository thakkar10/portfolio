import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { embedText, cosineSimilarity } from '@/lib/embeddings'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // If OpenAI is not configured, disable semantic search gracefully
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json([])
    }

    await connectDB()
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const type = searchParams.get('type') // 'image' | 'video'
    const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 60)

    if (!q) return NextResponse.json([])

    const query = { embedding: { $exists: true }, ...(type ? { type } : {}) }
    const docs = await Media.find(query).select({ title: 1, category: 1, type: 1, cloudinaryUrl: 1, caption: 1, embedding: 1 }).lean()

    if (!docs.length) return NextResponse.json([])

    const qVec = await embedText(q)

    const ranked = docs
      .map(d => ({ doc: d, score: cosineSimilarity(qVec, d.embedding || []) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => ({ ...x.doc, _score: x.score }))

    return NextResponse.json(ranked)
  } catch (error) {
    console.error('Semantic search error:', error)
    return NextResponse.json([], { status: 200 })
  }
}
