import { captionImage } from '@/lib/embeddings'
import { getOptimizedImageUrl } from '@/lib/imageUtils'
import Media from '@/models/Media'

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'around',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'into',
  'of',
  'on',
  'or',
  'the',
  'through',
  'to',
  'with',
])

function cleanSummary(text) {
  return String(text || '')
    .replace(/^["'`]+|["'`.]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokensFor(text) {
  return cleanSummary(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

function similarity(a, b) {
  const first = new Set(tokensFor(a))
  const second = new Set(tokensFor(b))
  if (!first.size || !second.size) return 0

  let overlap = 0
  first.forEach((token) => {
    if (second.has(token)) overlap += 1
  })

  return overlap / Math.min(first.size, second.size)
}

function isRepeated(summary, existingCaptions) {
  return existingCaptions.some((caption) => {
    const cleanCaption = cleanSummary(caption)
    return cleanCaption.toLowerCase() === summary.toLowerCase() || similarity(summary, cleanCaption) > 0.72
  })
}

function fallbackCaptions({ title, category, tags }) {
  const cleanTitle = cleanSummary(title) || 'Untitled frame'
  const cleanCategory = cleanSummary(category).toLowerCase() || 'portfolio'
  const tagDetail = Array.isArray(tags) && tags.length ? ` with ${tags.slice(0, 2).join(' and ')}` : ''

  return [
    `${cleanTitle} captures a refined ${cleanCategory} moment${tagDetail}.`,
    `A composed ${cleanCategory} frame shaped by light, mood, and quiet detail.`,
    `A cinematic ${cleanCategory} image with a focused editorial feel.`,
    `A distinct portfolio frame centered on atmosphere, texture, and composition.`,
  ]
}

function uniqueSummary(candidate, existingCaptions, metadata) {
  const cleanedCandidate = cleanSummary(candidate)
  if (cleanedCandidate && !isRepeated(cleanedCandidate, existingCaptions)) {
    return cleanedCandidate
  }

  const fallback = fallbackCaptions(metadata).find((summary) => !isRepeated(summary, existingCaptions))
  if (fallback) return fallback

  return `${fallbackCaptions(metadata)[0]} Alternate perspective.`
}

function buildCaptionPrompt({ title, category, existingCaptions }) {
  const avoidList = existingCaptions.slice(0, 25).map((caption) => `- ${caption}`).join('\n')

  return [
    'Write one short portfolio caption for this image.',
    'Maximum 18 words.',
    'Describe visible subject, mood, light, composition, or setting.',
    'Use polished editorial language, but keep it natural.',
    'Do not mention camera gear.',
    'Do not use the words photo, picture, image, or shot.',
    'Do not repeat or closely paraphrase existing captions.',
    title ? `Title: ${title}` : '',
    category ? `Category: ${category}` : '',
    avoidList ? `Existing captions to avoid:\n${avoidList}` : '',
    'Return only the caption.',
  ].filter(Boolean).join('\n')
}

async function getExistingCaptions(category) {
  const query = {
    caption: { $exists: true, $ne: '' },
  }

  if (category) query.category = category

  const records = await Media.find(query)
    .sort({ createdAt: -1 })
    .select('caption')
    .limit(80)
    .lean()

  return records.map((record) => record.caption).filter(Boolean)
}

export async function generateMediaSummary({ title, category, type, cloudinaryUrl, tags = [] }) {
  const existingCaptions = await getExistingCaptions(category)
  const metadata = { title, category, tags }
  let generated = ''

  if (type === 'image' && cloudinaryUrl && process.env.GEMINI_API_KEY) {
    try {
      generated = await captionImage(
        getOptimizedImageUrl(cloudinaryUrl, 1200, 80),
        buildCaptionPrompt({ title, category, existingCaptions })
      )
    } catch (error) {
      console.warn('Image caption generation failed; using fallback summary.', error)
    }
  }

  return uniqueSummary(generated, existingCaptions, metadata)
}
