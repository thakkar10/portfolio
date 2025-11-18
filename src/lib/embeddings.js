let _genAI = null

async function getGenAI() {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured')
    const pkg = '@google/generative-ai'
    const mod = await import(pkg)
    const { GoogleGenerativeAI } = mod
    _genAI = new GoogleGenerativeAI(apiKey)
  }
  return _genAI
}

export async function captionImage(url) {
  const genAI = await getGenAI()
  // Use gemini-2.5-flash-preview-05-20 for image understanding (fast and free tier)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' })
  const prompt = `Provide a concise, descriptive caption for this image suitable for search. Focus on visual elements, style, mood, and subject matter.`
  
  // Fetch image and convert to base64
  const imageResponse = await fetch(url)
  const imageBuffer = await imageResponse.arrayBuffer()
  const imageBase64 = Buffer.from(imageBuffer).toString('base64')
  const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'
  
  const res = await model.generateContent([
    {
      text: prompt,
    },
    {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    },
  ])
  
  const caption = res.response.text()?.trim() || ''
  return caption
}

export async function embedText(text) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')
  
  const input = (text || '').slice(0, 2000) // text-embedding-004 supports longer text
  
  // Use REST API with text-embedding-004 model
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      model: 'models/text-embedding-004',
      content: { 
        parts: [{ text: input }] 
      } 
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini embedding API error: ${response.status} ${error}`)
  }
  
  const data = await response.json()
  return data.embedding?.values || []
}

export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return -1
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] || 0
    const bi = b[i] || 0
    dot += ai * bi
    na += ai * ai
    nb += bi * bi
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1
  return dot / denom
}
