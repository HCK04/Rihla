import { NextRequest } from 'next/server'
import marrakechSpots from '@/content/spots/marrakech.json'
import fezSpots from '@/content/spots/fez.json'
import casablancaSpots from '@/content/spots/casablanca.json'
import rabatSpots from '@/content/spots/rabat.json'
import tangierSpots from '@/content/spots/tangier.json'
import agadirSpots from '@/content/spots/agadir.json'

const CITY_SPOTS: Record<string, typeof marrakechSpots> = {
  marrakech: marrakechSpots,
  fez: fezSpots,
  casablanca: casablancaSpots,
  rabat: rabatSpots,
  tangier: tangierSpots,
  agadir: agadirSpots,
}

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'Respond in English.',
  fr: 'Réponds en français.',
  ar: 'أجب باللغة العربية.',
  es: 'Responde en español.',
  pt: 'Responde em português.',
  de: 'Antworte auf Deutsch.',
}

interface PlannerPreferences {
  interests?: string[]
  pace?: string
  budget?: string
  matchTime?: string
  stadiumPosition?: string
}

function buildPrompt(city: string, teamName: string, days: number, lang: string, spotsContext: string, preferences: PlannerPreferences) {
  const cityLabel = city.charAt(0).toUpperCase() + city.slice(1)
  const interests = preferences.interests?.length ? preferences.interests.join(', ') : 'balanced culture, food, and hidden gems'
  const pace = preferences.pace || 'balanced'
  const budget = preferences.budget || 'mid-range'
  const matchTime = preferences.matchTime || 'evening'
  const stadiumPosition = preferences.stadiumPosition || 'general stadium access'

  return `You are Rihla, an expert Morocco travel curator. A fan of ${teamName} is visiting ${cityLabel} for the FIFA World Cup 2030.

Create a ${days}-day itinerary using the spots listed below. Mix iconic spots with genuine hidden gems.

Personalization requirements:
- Traveler interests: ${interests}
- Preferred pace: ${pace}
- Budget comfort: ${budget}
- Match kickoff window: ${matchTime}
- Stadium position / access preference: ${stadiumPosition}

Structure around: Day 1 = Arrival and Discovery, Day 2 = Match Day, Day 3 = Deep Dive.
On match day, make the schedule realistic around kickoff time and stadium access. Put heavier activities before the match for evening kickoff, lighter nearby activities for afternoon kickoff, and recovery-friendly options after late matches.
Respect the user's interests and pace when choosing spots. Do not include a spot only because it is famous if it conflicts with the selected preferences.

Available spots in ${cityLabel}:
${spotsContext}

${LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en}

Return ONLY valid JSON, with no markdown and no explanation:
{
  "days": [
    {
      "day": 1,
      "label": "Arrival and Discovery",
      "theme": "one evocative sentence setting the day's mood",
      "slots": [
        { "time": "Morning", "activity": "short label", "spot": "Spot Name - one vivid reason to go", "spotId": "the-spot-id-from-list", "rarityScore": 42 },
        { "time": "Afternoon", "activity": "short label", "spot": "Spot Name - one vivid reason to go", "spotId": "the-spot-id-from-list", "rarityScore": 68 },
        { "time": "Evening", "activity": "short label", "spot": "Spot Name - one vivid reason to go", "spotId": "the-spot-id-from-list", "rarityScore": 55 }
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

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(req: NextRequest) {
  const { city, teamName, days = 3, lang = 'en', preferences = {} } = await req.json()

  const spots = (CITY_SPOTS[city] ?? marrakechSpots)
    .sort((a, b) => b.rarity - a.rarity)
    .slice(0, 15)

  const spotsContext = spots.map(s => {
    const name = (s.name as Record<string, string>).en
    const desc = (s.description as Record<string, string>).en
    return `- id:"${s.id}" name:"${name}" (rarity ${s.rarity}/100, ${s.category}): ${desc}`
  }).join('\n')

  const prompt = buildPrompt(city, teamName, days, lang, spotsContext, preferences)
  const groqKey = process.env.GROQ_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  let responseText = ''

  if (groqKey) {
    try {
      responseText = await groqGenerate(groqKey, prompt)
    } catch (error) {
      console.error('[itinerary] Groq error:', error)
    }
  }

  if (!responseText && anthropicKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
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
    return Response.json({ error: 'No AI key configured. Add GROQ_API_KEY or ANTHROPIC_API_KEY to .env.local' }, { status: 500 })
  }

  const match = responseText.match(/\{[\s\S]*\}/)
  if (!match) return Response.json({ error: 'AI returned unexpected format' }, { status: 500 })

  try {
    return Response.json(JSON.parse(match[0]))
  } catch {
    return Response.json({ error: 'Failed to parse itinerary JSON' }, { status: 500 })
  }
}
