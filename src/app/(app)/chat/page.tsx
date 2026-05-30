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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 300)
  }, [])

  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
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

  const prompts = chatPrompts(lang)
  const hasUserMessages = messages.length > 0

  return (
    <div className="flex h-dvh flex-col" style={{ background: '#0F0E0C' }}>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pb-4 pt-safe-12 flex-shrink-0"
        style={{ background: 'rgba(15,14,12,0.92)', borderBottom: '0.5px solid rgba(232,168,56,0.20)', backdropFilter: 'blur(18px)' }}
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#C4622D', boxShadow: '0 8px 24px rgba(196,98,45,0.28)' }}
        >
          <Sparkles size={18} color="#ffffff" strokeWidth={1.5} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: '#17110A', lineHeight: '24px' }}>
            {t(lang, 'ask_rihla')}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#B9AD9B' }}>
            Marrakech Medina · Match day ready
          </p>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 min-h-0">

        {/* AI greeting — always shown as first bubble */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-start items-end gap-2"
        >
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5"
            style={{ background: '#C4622D' }}
          >
            <Sparkles size={12} color="#ffffff" strokeWidth={1.5} />
          </div>
          <div
            className="px-4 py-3"
            style={{
              maxWidth: '78%',
              background: '#1E1D1A',
              border: '1px solid rgba(232,168,56,0.22)',
              borderLeft: '3px solid #E8A838',
              borderRadius: '4px 20px 20px 20px',
              boxShadow: '0 8px 32px rgba(196,98,45,0.12)',
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              lineHeight: '24px',
              color: '#F5EFE6',
              direction: lang === 'ar' ? 'rtl' : 'ltr',
            }}
          >
            {t(lang, 'chat_empty_subtitle')}
          </div>
        </motion.div>

        {/* Conversation messages */}
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5"
                  style={{ background: '#C4622D' }}
                >
                  <Sparkles size={12} color="#ffffff" strokeWidth={1.5} />
                </div>
              )}
              <div
                className="px-4 py-3"
                style={{
                  maxWidth: '78%',
                  background: msg.role === 'user' ? '#C4622D' : '#1E1D1A',
                  color: '#F5EFE6',
                  border: msg.role === 'assistant' ? '1px solid rgba(232,168,56,0.22)' : '1px solid rgba(196,98,45,0.40)',
                  borderLeft: msg.role === 'assistant' ? '3px solid #E8A838' : '1px solid rgba(196,98,45,0.40)',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                  boxShadow: msg.role === 'assistant' ? '0 8px 32px rgba(196,98,45,0.12)' : '0 8px 24px rgba(196,98,45,0.18)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  direction: lang === 'ar' ? 'rtl' : 'ltr',
                  textAlign: lang === 'ar' ? 'right' : 'left',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content || (
                  <span className="flex gap-1 py-0.5">
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

      {/* Suggestion chips — horizontal scroll, hidden after first message */}
      <AnimatePresence>
        {!hasUserMessages && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-none px-5 pb-3 pt-1">
              {prompts.slice(0, 4).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="flex-shrink-0 transition-all duration-150 active:scale-[0.96]"
                  style={{
                    height: 36,
                    padding: '0 14px',
                    borderRadius: 9999,
                    background: '#1A1815',
                    border: '1px solid rgba(232,168,56,0.20)',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#D9CCB7',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div
        className="flex-shrink-0 px-5 py-3 safe-bottom"
        style={{ background: 'rgba(15,14,12,0.92)', borderTop: '0.5px solid rgba(232,168,56,0.20)', backdropFilter: 'blur(18px)' }}
      >
        <div
          className="flex items-end gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: '#1A1815',
            boxShadow: '0 8px 32px rgba(196,98,45,0.15)',
            border: '1px solid rgba(232,168,56,0.20)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); resizeTextarea() }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder={t(lang, 'ask_morocco')}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              color: '#F5EFE6',
              maxHeight: 120,
              lineHeight: '24px',
              direction: lang === 'ar' ? 'rtl' : 'ltr',
              textAlign: lang === 'ar' ? 'right' : 'left',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-25 active:scale-95"
            style={{ background: '#C4622D', flexShrink: 0 }}
          >
            <Send size={15} color="#ffffff" />
          </button>
        </div>
      </div>

    </div>
  )
}
