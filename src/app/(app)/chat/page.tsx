'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { t, chatPrompts } from '@/lib/i18n'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const { lang } = useLang()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          lang,
        }),
      })
      if (!res.ok) throw new Error('API error')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content ?? ''
                if (delta) {
                  assistantContent += delta
                  setMessages(prev => prev.map(m =>
                    m.id === assistantId ? { ...m, content: assistantContent } : m
                  ))
                }
              } catch {}
            }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: t(lang, 'something_went_wrong'),
      }])
    } finally {
      setLoading(false)
    }
  }

  const isEmpty = messages.length === 0
  const prompts = chatPrompts(lang)

  return (
    <div className="flex flex-col h-dvh" style={{ background: '#faf8f4' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pb-4 pt-safe-12"
        style={{ background: '#faf8f4', borderBottom: '0.5px solid rgba(44,62,80,0.08)' }}
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#8c3500', boxShadow: '0 4px 12px rgba(158,61,0,0.20)' }}
        >
          <Sparkles size={18} color="#ffffff" strokeWidth={1.5} />
        </div>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#1b1c1a',
              lineHeight: '24px',
            }}
          >
            {t(lang, 'chat_title')}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#594238' }}>
            {t(lang, 'chat_subtitle')}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center py-6">
            <div className="relative mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #FEF3EE 0%, #FFF8F5 100%)',
                  border: '1px solid rgba(107,34,0,0.12)',
                  boxShadow: '0 8px 32px rgba(107,34,0,0.10)',
                }}
              >
                <Sparkles size={28} color="#6B2200" strokeWidth={1.5} />
              </div>
            </div>
            <h2
              className="mb-2 text-center"
              style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 600, color: '#17110A', letterSpacing: '-0.01em' }}
            >
              {t(lang, 'chat_empty_title')}
            </h2>
            <p
              className="text-center mb-8"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#7A5C4E', maxWidth: 270, lineHeight: '23px' }}
            >
              {t(lang, 'chat_empty_subtitle')}
            </p>
            <div className="w-full flex flex-col gap-2.5">
              {prompts.map((prompt, i) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left flex items-center gap-3 px-4 transition-all duration-150 active:scale-[0.98]"
                  style={{
                    height: 54,
                    borderRadius: 16,
                    background: '#ffffff',
                    border: '1px solid rgba(217,184,168,0.38)',
                    borderLeft: i === 0 ? '3px solid #8C3500' : '1px solid rgba(217,184,168,0.38)',
                    boxShadow: '0 2px 10px rgba(23,17,10,0.05)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#2A1A0E',
                    direction: lang === 'ar' ? 'rtl' : 'ltr',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5"
                      style={{ background: '#8c3500' }}
                    >
                      <Sparkles size={12} color="#ffffff" strokeWidth={1.5} />
                    </div>
                  )}
                  <div
                    className="max-w-[78%] px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: msg.role === 'user' ? '#8c3500' : '#ffffff',
                      color: msg.role === 'user' ? '#ffffff' : '#1b1c1a',
                      borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                      boxShadow: msg.role === 'assistant' ? '0 4px 16px rgba(44,62,80,0.08)' : 'none',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 400,
                      lineHeight: '24px',
                      direction: lang === 'ar' ? 'rtl' : 'ltr',
                      textAlign: lang === 'ar' ? 'right' : 'left',
                    }}
                  >
                    {msg.content || (
                      <span className="flex gap-1 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="px-5 py-3 safe-bottom"
        style={{ background: '#faf8f4', borderTop: '0.5px solid rgba(44,62,80,0.08)' }}
      >
        <div
          className="flex items-end gap-3 px-4 py-3 rounded-2xl"
          style={{ background: '#ffffff', boxShadow: '0 4px 16px rgba(44,62,80,0.08)' }}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder={t(lang, 'ask_morocco')}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              color: '#1b1c1a',
              maxHeight: 120,
              direction: lang === 'ar' ? 'rtl' : 'ltr',
              textAlign: lang === 'ar' ? 'right' : 'left',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-30"
            style={{ background: '#8c3500' }}
          >
            <Send size={15} color="#ffffff" />
          </button>
        </div>
      </div>
    </div>
  )
}
