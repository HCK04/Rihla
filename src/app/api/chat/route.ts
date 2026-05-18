import { NextRequest } from 'next/server'

const BASE_SYSTEM_PROMPT = `You are RihlAI, an expert Morocco travel guide with deep knowledge of local culture, hidden gems, food, and practical tips across the 6 WC2030 host cities: Casablanca, Rabat, Tangier, Marrakech, Agadir, and Fez.

You specialise in:
- Hidden gems and local spots most tourists never find
- Authentic Moroccan food and where locals actually eat
- Cultural context and history behind places
- Practical advice (best times, prices, how to get there)
- Useful Darija phrases for travellers

Keep answers concise, warm, and locally knowledgeable. Name specific spots, streets, and practical details. Never recommend tourist traps when a genuine local alternative exists.`

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'Always respond in English.',
  fr: 'Réponds toujours en français.',
  ar: 'أجب دائماً باللغة العربية.',
  es: 'Responde siempre en español.',
  pt: 'Responde sempre em português.',
}

export async function POST(req: NextRequest) {
  const { messages, lang = 'en' } = await req.json()
  const langInstruction = LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en
  const SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}\n\n${langInstruction}`

  const ollamaBase   = process.env.OLLAMA_BASE_URL
  const ollamaModel  = process.env.OLLAMA_MODEL ?? 'llama3'
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  // ── Ollama path (with fallback on connection error) ────────────────────
  if (ollamaBase) {
    try {
      const response = await fetch(`${ollamaBase}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          stream: true,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-10),
          ],
        }),
      })

      if (response.ok) {
        return new Response(response.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      }
    } catch {
      // Ollama not running — fall through to Anthropic
    }
  }

  // ── Anthropic fallback ─────────────────────────────────────────────────
  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: 'AI unavailable. Set ANTHROPIC_API_KEY in .env.local or start Ollama.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      stream: true,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-10),
    }),
  })

  if (!response.ok) {
    return new Response(JSON.stringify({ error: await response.text() }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Convert Anthropic SSE → OpenAI-compatible SSE
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            continue
          }
          try {
            const event = JSON.parse(data)
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              const payload = JSON.stringify({ choices: [{ delta: { content: event.delta.text } }] })
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
            }
          } catch {}
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })
}
