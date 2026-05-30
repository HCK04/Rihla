import { NextRequest } from 'next/server'

const BASE_SYSTEM_PROMPT = `You are Rihla, an expert Morocco travel guide with deep knowledge of local culture, hidden gems, food, and practical tips across the 6 WC2030 host cities: Casablanca, Rabat, Tangier, Marrakech, Agadir, and Fez.

You specialise in:
- Hidden gems and local spots most tourists never find
- Authentic Moroccan food and where locals actually eat
- Cultural context and history behind places
- Practical advice: best times, prices, how to get there
- Useful Darija phrases for travellers

Keep answers concise, warm, and locally knowledgeable. Name specific spots, streets, and practical details. Never recommend tourist traps when a genuine local alternative exists.`

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'Always respond in English.',
  fr: 'Réponds toujours en français.',
  ar: 'أجب دائماً باللغة العربية.',
  es: 'Responde siempre en español.',
  pt: 'Responde sempre em português.',
  de: 'Antworte immer auf Deutsch.',
}

export async function POST(req: NextRequest) {
  const { messages, lang = 'en' } = await req.json()
  const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en}`

  const groqKey = process.env.GROQ_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (groqKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        stream: true,
        messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
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
  }

  if (!anthropicKey) {
    return Response.json({ error: 'No AI key configured. Add GROQ_API_KEY or ANTHROPIC_API_KEY to .env.local' }, { status: 500 })
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
      system: systemPrompt,
      messages: messages.slice(-10),
    }),
  })

  if (!response.ok) {
    return Response.json({ error: await response.text() }, { status: response.status })
  }

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
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
