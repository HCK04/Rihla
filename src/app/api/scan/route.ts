import { NextRequest } from 'next/server'

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'Write description, culturalStory, and bestTime in English.',
  fr: 'Écris description, culturalStory et bestTime en français.',
  ar: 'اكتب description وculturalStory وbestTime باللغة العربية.',
  es: 'Escribe description, culturalStory y bestTime en español.',
  pt: 'Escreve description, culturalStory e bestTime em português.',
}

function buildPrompt(lang: string) {
  return `You are a world-class expert in Moroccan culture, architecture, food, and history covering all 6 WC2030 host cities: Casablanca, Rabat, Tangier, Marrakech, Agadir, and Fez.

Analyse this image carefully. Note every visual detail: architectural style, materials, colours, decorative patterns, any text or inscriptions, the setting, and distinctive features. Then identify exactly what is shown. Only commit to a specific name if you are highly confident. If unclear, set confident to false.

${LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en} Keep "name" in its original local language with romanisation if needed.

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
}

export async function POST(req: NextRequest) {
  const { image, lang = 'en' } = await req.json()

  const groqKey     = process.env.GROQ_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const prompt = buildPrompt(lang)

  // ── Groq vision (free) ─────────────────────────────────────────────────
  if (groqKey) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    if (res.ok) {
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content ?? ''
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          const parsed = JSON.parse(match[0])
          if (parsed.confident === false) {
            return new Response(JSON.stringify({ error: 'not_confident' }), { status: 422, headers: { 'Content-Type': 'application/json' } })
          }
          return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } })
        } catch {}
      }
    }
  }

  // ── Anthropic fallback ─────────────────────────────────────────────────
  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: 'No AI key configured. Add GROQ_API_KEY to .env.local' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
          { type: 'text', text: prompt },
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
