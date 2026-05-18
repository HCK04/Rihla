import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { Phone, BRAND } from '../components/Phone'
import { BottomNav } from '../components/BottomNav'

const CPS = 55  // characters per second at 60fps → ~0.92 chars/frame

// Each message starts only after the previous one finishes typing
// startFrame is calculated cumulatively
const RAW = [
  { role: 'user',      text: 'Where should I eat in Marrakech as a first timer?' },
  { role: 'assistant', text: 'For a first visit, Jemaa el-Fna at sunset is unmissable — food stalls, harira soup, grilled meats. For something intimate, try Café des Épices in the medina for mint tea with a rooftop view.' },
  { role: 'user',      text: 'Any hidden gems?' },
  { role: 'assistant', text: 'Le Jardin Secret — a restored 16th-century palace garden in the heart of the medina, rarely crowded even in peak season. Worth every dirham.' },
]

// Build messages with start frames
const PAUSE = 18  // frames pause between messages
const MESSAGES = (() => {
  const out: { role: string; text: string; startFrame: number; endFrame: number }[] = []
  let cursor = 8
  for (const m of RAW) {
    const start = cursor
    const frames = Math.ceil(m.text.length / CPS * 60)
    const end = start + frames
    out.push({ ...m, startFrame: start, endFrame: end })
    cursor = end + PAUSE
  }
  return out
})()

function typeText(text: string, frame: number, startFrame: number): string {
  const elapsed = Math.max(0, frame - startFrame)
  const chars = Math.floor(elapsed * CPS / 60)
  return text.slice(0, chars)
}

export const SceneChat: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const totalHeight = MESSAGES.length * 90
  const lastVisible = MESSAGES.filter(m => frame >= m.startFrame).length
  const scrollY = interpolate(
    frame,
    [MESSAGES[1].startFrame, MESSAGES[MESSAGES.length - 1].endFrame],
    [0, -Math.max(0, totalHeight - 380)],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  )

  return (
    <Phone>
      {/* Header */}
      <div style={{
        padding: '52px 20px 16px', borderBottom: `0.5px solid ${BRAND.border}`,
        background: 'rgba(250,247,242,0.97)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 13, background: BRAND.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>✦</div>
          <div>
            <div style={{ fontFamily: BRAND.fontD, fontSize: 18, fontWeight: 700, color: BRAND.dark }}>RihlAI Chat</div>
            <div style={{ fontFamily: BRAND.fontS, fontSize: 12, color: BRAND.muted }}>Ask anything about Morocco</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        padding: '16px 16px 100px',
        display: 'flex', flexDirection: 'column', gap: 14,
        transform: `translateY(${scrollY}px)`,
        transition: 'transform 0.1s',
      }}>
        {MESSAGES.map((msg, i) => {
          if (frame < msg.startFrame) return null
          const isUser = msg.role === 'user'
          const displayed = typeText(msg.text, frame, msg.startFrame)
          const msgS = spring({ frame: Math.max(0, frame - msg.startFrame), fps, config: { damping: 20, stiffness: 100 } })
          const stillTyping = displayed.length < msg.text.length
          const cursorBlink = Math.sin(frame / 7) > 0

          return (
            <div key={i} style={{
              display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8,
              opacity: interpolate(msgS, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(msgS, [0, 1], [12, 0])}px)`,
            }}>
              {!isUser && (
                <div style={{
                  width: 28, height: 28, borderRadius: 9, background: BRAND.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, flexShrink: 0,
                }}>✦</div>
              )}
              <div style={{
                maxWidth: '76%',
                padding: isUser ? '10px 14px' : '12px 16px',
                borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isUser ? BRAND.primary : BRAND.card,
                boxShadow: isUser ? '0 4px 16px rgba(107,34,0,0.28)' : '0 4px 16px rgba(23,17,10,0.08)',
                fontFamily: BRAND.fontS, fontSize: 14, lineHeight: '21px',
                color: isUser ? '#FFF' : BRAND.dark,
              }}>
                {displayed}
                {stillTyping && (
                  <span style={{ opacity: cursorBlink ? 1 : 0, color: isUser ? 'rgba(255,255,255,0.6)' : BRAND.muted }}>|</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input bar */}
      <div style={{
        position: 'absolute', bottom: 80, left: 0, right: 0,
        padding: '0 16px 12px',
        background: 'linear-gradient(to top, rgba(250,247,242,1) 65%, transparent)',
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: BRAND.card, borderRadius: 16, padding: '10px 14px',
          border: `1px solid ${BRAND.border}`,
          boxShadow: '0 4px 20px rgba(23,17,10,0.08)',
        }}>
          <div style={{ flex: 1, fontFamily: BRAND.fontS, fontSize: 14, color: BRAND.muted }}>
            Ask about Morocco…
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: BRAND.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#FFF',
          }}>↑</div>
        </div>
      </div>

      <BottomNav active="Chat" />
    </Phone>
  )
}
