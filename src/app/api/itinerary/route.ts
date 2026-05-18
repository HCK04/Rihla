import { NextRequest } from 'next/server'
import marrakechSpots from '@/data/spots/marrakech.json'
import fezSpots from '@/data/spots/fez.json'
import casablancaSpots from '@/data/spots/casablanca.json'
import rabatSpots from '@/data/spots/rabat.json'
import tangierSpots from '@/data/spots/tangier.json'
import agadirSpots from '@/data/spots/agadir.json'

const CITY_SPOTS: Record<string, typeof marrakechSpots> = {
  marrakech: marrakechSpots, fez: fezSpots,
  casablanca: casablancaSpots, rabat: rabatSpots,
  tangier: tangierSpots, agadir: agadirSpots,
}

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'Respond in English.',
  fr: 'Réponds en français.',
  ar: 'أجب باللغة العربية.',
  es: 'Responde en español.',
  pt: 'Responde em português.',
}

function buildPrompt(city: string, teamName: string, days: number, lang: string, spotsContext: string) {
  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1)
  return `You are RihlAI, an expert Morocco travel curator. A fan of ${teamName} is visiting ${cityLabel} for the FIFA World Cup 2030.

Create a ${days}-day itinerary using the spots listed below. Mix iconic spots with genuine hidden gems. Structure around: Day 1 = Arrival & Discovery, Day 2 = Match Day, Day 3 = Deep Dive.

Available spots in ${cityLabel}:
${spotsContext}

${LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en}

Return ONLY valid JSON (no markdown, no explanation):
{
  "days": [
    {
      "day": 1,
      "label": "Arrival & Discovery",
      "theme": "one evocative sentence setting the day's mood",
      "slots": [
        { "time": "Morning",   "activity": "short label", "spot": "Spot Name — one vivid reason to go", "spotId": "the-spot-id-from-list", "rarityScore": 42 },
        { "time": "Afternoon", "activity": "short label", "spot": "Spot Name — one vivid reason to go", "spotId": "the-spot-id-from-list", "rarityScore": 68 },
        { "time": "Evening",   "activity": "short label", "spot": "Spot Name — one vivid reason to go", "spotId": "the-spot-id-from-list", "rarityScore": 55 }
      ]
    }
  ]
}`
}

async function groqGenerate(key: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Groq ${res.status}: ${body}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(req: NextRequest) {
  const { city, teamName, days = 3, lang = 'en' } = await req.json()

  const spots = (CITY_SPOTS[city] ?? marrakechSpots)
    .sort((a, b) => b.rarity - a.rarity)
    .slice(0, 15)
  const spotsContext = spots.map(s => {
    const name = (s.name as Record<string, string>).en
    const desc = (s.description as Record<string, string>).en
    return `- id:"${s.id}" name:"${name}" (rarity ${s.rarity}/100, ${s.category}): ${desc}`
  }).join('\n')

  const prompt = buildPrompt(city, teamName, days, lang, spotsContext)

  const groqKey     = process.env.GROQ_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  let responseText = ''

  // ── Groq (free) ────────────────────────────────────────────────────────
  if (groqKey) {
    try {
      responseText = await groqGenerate(groqKey, prompt)
    } catch (e) {
      console.error('[itinerary] Groq error:', e)
    }
  }

  // ── Anthropic fallback ─────────────────────────────────────────────────
  if (!responseText && anthropicKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (res.ok) {
      const data = await res.json()
      responseText = data.content?.[0]?.text ?? ''
    }
  }

  if (!responseText) {
    return new Response(
      JSON.stringify({ error: 'No AI key configured. Add GROQ_API_KEY to .env.local' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const match = responseText.match(/\{[\s\S]*\}/)
  if (!match) {
    return new Response(JSON.stringify({ error: 'AI returned unexpected format' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const itinerary = JSON.parse(match[0])
    return new Response(JSON.stringify(itinerary), { headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to parse itinerary JSON' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
