import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion'
import { Phone, BRAND } from '../components/Phone'
import { BottomNav } from '../components/BottomNav'
import { RarityBadge } from '../components/RarityBadge'

// Frame timeline (within this Sequence):
// 0  – 50  : idle view
// 50 – 130 : loading / analysing
// 130 – end: result

export const SceneScan: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const phase: 'idle' | 'loading' | 'result' =
    frame < 50 ? 'idle' : frame < 130 ? 'loading' : 'result'

  const idleO    = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
  const loadO    = interpolate(frame, [50, 66], [0, 1], { extrapolateRight: 'clamp' })
  const loadFade = interpolate(frame, [115, 130], [1, 0], { extrapolateRight: 'clamp' })
  const pulse    = 0.55 + Math.sin(frame / 10) * 0.45
  const resultS  = spring({ frame: Math.max(0, frame - 130), fps, config: { damping: 16, stiffness: 80 } })

  return (
    <Phone>
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', borderBottom: `0.5px solid ${BRAND.border}` }}>
        <div style={{ fontFamily: BRAND.fontD, fontSize: 34, fontWeight: 700, color: BRAND.dark }}>Identify</div>
        <div style={{ fontFamily: BRAND.fontS, fontSize: 14, color: BRAND.muted, marginTop: 4 }}>
          Point at a monument, food, or Arabic sign
        </div>
      </div>

      {/* Content area */}
      <div style={{
        position: 'absolute', top: 116, left: 0, right: 0, bottom: 80,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 20px',
      }}>
        {/* IDLE */}
        {phase === 'idle' && (
          <div style={{ opacity: idleO, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 240, height: 240, borderRadius: 28, background: BRAND.card,
              boxShadow: '0 16px 48px rgba(23,17,10,0.12)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', gap: 12,
            }}>
              {[
                { top: 14, left: 14, borderTop: `2px solid ${BRAND.primary}`, borderLeft: `2px solid ${BRAND.primary}` },
                { top: 14, right: 14, borderTop: `2px solid ${BRAND.primary}`, borderRight: `2px solid ${BRAND.primary}` },
                { bottom: 14, left: 14, borderBottom: `2px solid ${BRAND.primary}`, borderLeft: `2px solid ${BRAND.primary}` },
                { bottom: 14, right: 14, borderBottom: `2px solid ${BRAND.primary}`, borderRight: `2px solid ${BRAND.primary}` },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 28, height: 28, borderRadius: 3, ...s }} />
              ))}
              <div style={{ fontSize: 44, color: BRAND.muted }}>⊙</div>
              <div style={{ fontFamily: BRAND.fontS, fontSize: 14, fontWeight: 500, color: '#6B5246' }}>Tap to scan</div>
            </div>
            <div style={{ fontFamily: BRAND.fontS, fontSize: 13, color: BRAND.muted, textAlign: 'center', maxWidth: 250, lineHeight: '20px' }}>
              Monuments, food dishes, architecture, signs in Arabic or French
            </div>
          </div>
        )}

        {/* LOADING */}
        {phase === 'loading' && (
          <div style={{
            opacity: loadO * loadFade,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          }}>
            <div style={{ width: 140, height: 140, borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(23,17,10,0.18)' }}>
              <Img
                src="https://images.unsplash.com/photo-1548007116517-c35985e1e4f5?auto=format&fit=crop&w=300&q=80"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              width: 72, height: 72, borderRadius: 20, background: BRAND.accent,
              border: `1px solid rgba(107,34,0,0.18)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, opacity: pulse,
            }}>✦</div>
            <div style={{ fontFamily: BRAND.fontD, fontSize: 20, fontWeight: 700, color: BRAND.dark }}>Identifying…</div>
            <div style={{ fontFamily: BRAND.fontS, fontSize: 14, color: BRAND.muted }}>Analysing cultural context</div>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <div style={{
            width: '100%',
            opacity: interpolate(resultS, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(resultS, [0, 1], [28, 0])}px)`,
          }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', background: BRAND.card, boxShadow: '0 16px 48px rgba(23,17,10,0.14)' }}>
              <div style={{ height: 200, position: 'relative' }}>
                <Img
                  src="https://images.unsplash.com/photo-1548007116517-c35985e1e4f5?auto=format&fit=crop&w=600&q=80"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(12,7,3,0.86) 100%)' }} />
                <div style={{ position: 'absolute', top: 12, right: 12 }}><RarityBadge score={72} dark /></div>
                <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                  <div style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 9999, marginBottom: 5,
                    background: 'rgba(0,0,0,0.42)',
                    fontFamily: BRAND.fontS, fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.10em', color: '#FFF', textTransform: 'uppercase',
                  }}>Food · Marrakech</div>
                  <div style={{ fontFamily: BRAND.fontD, fontSize: 22, fontWeight: 700, color: '#FFF' }}>Msemen</div>
                </div>
              </div>
              <div style={{ padding: 18 }}>
                <p style={{ fontFamily: BRAND.fontS, fontSize: 14, lineHeight: '22px', color: '#6B5246', marginBottom: 14 }}>
                  Layered Moroccan flatbread folded with butter and semolina — a street staple eaten warm with honey or argan oil.
                </p>
                <div style={{ height: 1, background: BRAND.border, marginBottom: 12 }} />
                <div style={{ fontFamily: BRAND.fontS, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: BRAND.primary, marginBottom: 6, textTransform: 'uppercase' }}>Cultural Story</div>
                <p style={{ fontFamily: BRAND.fontS, fontSize: 13, lineHeight: '20px', color: BRAND.dark }}>
                  Passed down through Berber households, msemen is the Moroccan answer to a lazy Sunday morning — folded by hand in a ritual unchanged for centuries.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <div style={{
                flex: 1, height: 52, borderRadius: 16, background: '#EAE6DF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: BRAND.fontS, fontSize: 14, color: '#6B5246', gap: 6,
              }}>↺  Scan another</div>
              <div style={{
                flex: 1, height: 52, borderRadius: 16, background: BRAND.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: BRAND.fontS, fontSize: 14, fontWeight: 600, color: '#FFF', gap: 6,
                boxShadow: '0 6px 24px rgba(107,34,0,0.30)',
              }}>+ Add to Plan</div>
            </div>
          </div>
        )}
      </div>

      <BottomNav active="Scan" />
    </Phone>
  )
}
