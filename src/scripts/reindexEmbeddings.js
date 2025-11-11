#!/usr/bin/env node
import 'dotenv/config'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'
import { captionImage, embedText } from '@/lib/embeddings'

async function run() {
  await connectDB()
  const items = await Media.find({ type: 'image', cloudinaryUrl: { $exists: true, $ne: '' } }).lean()
  console.log(`Found ${items.length} images to (re)index`)

  let updated = 0, failed = 0
  for (const m of items) {
    try {
      const url = m.cloudinaryUrl
      const caption = await captionImage(url)
      const vector = await embedText(caption)
      await Media.updateOne({ _id: m._id }, { $set: { caption, embedding: vector } })
      updated++
      console.log(`Indexed ${m._id}: ${caption.slice(0, 80)}... (${vector.length} dims)`)
    } catch (e) {
      failed++
      console.error(`Failed ${m._id}:`, e.message)
    }
  }
  console.log(`Done. Updated: ${updated}, Failed: ${failed}`)
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
