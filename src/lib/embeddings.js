let _client = null

async function getClient() {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured')
    const pkg = 'openai'
    const mod = await import(pkg)
    const OpenAI = mod.default || mod
    _client = new OpenAI({ apiKey })
  }
  return _client
}

export async function captionImage(url) {
  const client = await getClient()
  const prompt = `Provide a concise, descriptive caption for this image suitable for search.`
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You create short, descriptive image captions.' },
      { role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'input_image', image_url: url },
      ] },
    ],
    temperature: 0.2,
    max_tokens: 80,
  })
  const caption = res.choices?.[0]?.message?.content?.trim() || ''
  return caption
}

export async function embedText(text) {
  const client = await getClient()
  const input = (text || '').slice(0, 5000)
  const res = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input,
  })
  const vector = res.data?.[0]?.embedding || []
  return vector
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
