import { NextRequest } from 'next/server'

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'Write description, culturalStory, and bestTime in English.',
  fr: 'Écris description, culturalStory et bestTime en français.',
  ar: 'اكتب description وculturalStory وbestTime باللغة العربية.',
  es: 'Escribe description, culturalStory y bestTime en español.',
  pt: 'Escreve description, culturalStory e bestTime em português.',
}

// Pass 1: llava describes ONLY what it visually sees — no guessing allowed
const VISION_DESCRIBE_PROMPT = `Look at this image very carefully. Describe exactly what you see with precise visual details:
- Architecture style (arches, tiles, minarets, domes, zellige patterns, carved plaster, cedar wood, etc.)
- Materials and colours (terracotta, blue tiles, white walls, green copper, ochre stone, etc.)
- Any visible text, signage, Arabic calligraphy, or inscriptions
- People, clothing, activities
- Surrounding environment (medina alley, garden, square, market stall, coastal, mountain, etc.)
- Specific decorative elements (geometric patterns, star shapes, muqarnas, fountain, etc.)
- Type of place (mosque, riad, souk stall, restaurant, natural landscape, street food, etc.)
Be factual. Do not guess the name. Just describe what you see.`

// Pass 2: llama3.2 identifies from the visual description
function buildIdentifyPrompt(visualDescription: string, lang: string) {
  const langNote = LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en
  return `You are an expert in Moroccan culture, architecture, food, geography, and history covering all 6 WC2030 host cities: Casablanca, Rabat, Tangier, Marrakech, Agadir, and Fez.

A vision model produced this detailed visual description of a photo taken in Morocco:
"""
${visualDescription}
"""

Based on these visual details, identify what is shown. Only commit to a name if the description gives you enough specific details to be highly confident. If the description is too vague or generic (e.g. just "a wall" or "a street"), set confident to false.

${langNote} Keep "name" in its original local language (Arabic/French/Berber) with romanisation if needed.

Return ONLY valid JSON:
{
  "confident": true,
  "name": "Exact official or widely-used local name",
  "type": "One of: Monument · Mosque · Market · Food · Architecture · Nature · Art · Sign",
  "description": "One vivid sentence explaining what this is and why it matters",
  "culturalStory": "Two to three sentences of cultural or historical context with at least one specific fact (date, ruler, tradition, or local custom).",
  "rarity": <integer 1-100 — how off-the-tourist-trail this is>,
  "bestTime": "Specific best time of day or season to visit"
}`
}

async function ollamaChat(base: string, model: string, content: string, images?: string[], format?: string): Promise<string> {
  const message: Record<string, unknown> = { role: 'user', content }
  if (images) message.images = images
  const body: Record<string, unknown> = { model, stream: false, messages: [message] }
  if (format) body.format = format
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Ollama error ${res.status}`)
  const data = await res.json()
  return data.message?.content ?? ''
}

export async function POST(req: NextRequest) {
  const { image, lang = 'en' } = await req.json()

  const ollamaBase        = process.env.OLLAMA_BASE_URL
  const ollamaVisionModel = process.env.OLLAMA_VISION_MODEL ?? 'llava'
  const ollamaModel       = process.env.OLLAMA_MODEL ?? 'llama3.2'
  const anthropicKey      = process.env.ANTHROPIC_API_KEY

  // ── Two-pass Ollama path ───────────────────────────────────────────────
  if (ollamaBase) {
    try {
      // Pass 1 — llava: describe the image visually (no JSON, no guessing)
      const visualDescription = await ollamaChat(
        ollamaBase, ollamaVisionModel,
        VISION_DESCRIBE_PROMPT, [image]
      )

      if (visualDescription.trim().length < 20) throw new Error('Empty description')

      // Pass 2 — llama3.2: identify from the description (JSON mode)
      const identifyPrompt = buildIdentifyPrompt(visualDescription, lang)
      const identifyText = await ollamaChat(
        ollamaBase, ollamaModel,
        identifyPrompt, undefined, 'json'
      )

      const match = identifyText.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        if (parsed.confident === false) {
          return new Response(JSON.stringify({ error: 'not_confident' }), { status: 422, headers: { 'Content-Type': 'application/json' } })
        }
        return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } })
      }
    } catch {
      // Ollama unavailable — fall through to Anthropic
    }
  }

  // ── Anthropic Claude fallback (single-pass, highly accurate) ──────────
  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: 'AI unavailable. Set ANTHROPIC_API_KEY in .env.local or start Ollama.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const langNote = LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en
  const claudePrompt = `You are a world-class expert in Moroccan culture, architecture, food, and history. Analyse this image carefully and thoroughly before answering.

Step 1 — Observe: Note every visual detail: architectural style, materials, colours, decorative patterns, any text or inscriptions, the setting, and any distinctive features.
Step 2 — Identify: Based on your observations, identify exactly what is shown. Only commit to a specific name if you are highly confident. If unclear, set confident to false.
Step 3 — Contextualise: Provide rich cultural and historical context with specific facts.

${langNote} Keep "name" in its original local language with romanisation if needed.

Return ONLY valid JSON:
{
  "confident": true,
  "name": "Exact official or widely-used local name",
  "type": "One of: Monument · Mosque · Market · Food · Architecture · Nature · Art · Sign",
  "description": "One vivid sentence explaining what this is and why it matters",
  "culturalStory": "Two to three sentences of cultural or historical context with at least one specific fact.",
  "rarity": <integer 1-100>,
  "bestTime": "Specific best time of day or season to visit"
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
          { type: 'text', text: claudePrompt },
        ],
      }],
    }),
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ error: await response.text() }), {
      status: response.status, headers: { 'Content-Type': 'application/json' },
    })
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    return new Response(JSON.stringify({ error: 'Could not parse response' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const parsed = JSON.parse(match[0])
    if (parsed.confident === false) {
      return new Response(JSON.stringify({ error: 'not_confident' }), { status: 422, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON from AI' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
