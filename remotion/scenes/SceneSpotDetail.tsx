import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion'
import { Phone, BRAND } from '../components/Phone'
import { BottomNav } from '../components/BottomNav'
import { RarityBadge } from '../components/RarityBadge'

export const SceneSpotDetail: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const heroScale  = interpolate(frame, [0, 80], [1.08, 1.0], { extrapolateRight: 'clamp' })
  const overlayO   = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' })
  const scrollY    = interpolate(frame, [30, 200], [0, -220], { extrapolateRight: 'clamp' })
  const contentS   = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 18, stiffness: 75 } })

  return (
    <Phone>
      <div style={{ transform: `translateY(${scrollY}px)` }}>
        {/* Hero */}
        <div style={{ height: 320, position: 'relative', overflow: 'hidden', background: '#1a0800' }}>
          <Img
            src="https://images.unsplash.com/photo-1500462918725-6fdc92a2571a?auto=format&fit=crop&w=800&q=85"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: `scale(${heroScale})`, transformOrigin: 'center',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0, opacity: overlayO,
            background: 'linear-gradient(to bottom, rgba(12,7,3,0.28) 0%, transparent 38%, rgba(12,7,3,0.90) 100%)',
          }} />

          {/* Back pill */}
          <div style={{
            position: 'absolute', top: 52, left: 20,
            background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)',
            border: '0.5px solid rgba(255,255,255,0.18)',
            borderRadius: 9999, padding: '6px 14px',
            fontFamily: BRAND.fontS, fontSize: 13, fontWeight: 500, color: '#FFF',
            opacity: overlayO,
          }}>‹ Back</div>

          {/* Rarity */}
          <div style={{ position: 'absolute', top: 52, right: 20, opacity: overlayO }}>
            <RarityBadge score={55} dark />
          </div>

          {/* Title */}
          <div style={{
            position: 'absolute', bottom: 20, left: 20, right: 20,
            opacity: overlayO,
          }}>
            <div style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 9999, marginBottom: 6,
              background: 'rgba(0,0,0,0.42)',
              fontFamily: BRAND.fontS, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.12em', color: '#FFF', textTransform: 'uppercase',
            }}>Culture · Marrakech</div>
            <div style={{ fontFamily: BRAND.fontD, fontSize: 26, fontWeight: 700, color: '#FFF', lineHeight: '32px' }}>
              Jemaa el-Fna
            </div>
          </div>
        </div>

        {/* Detail card */}
        <div style={{
          background: BRAND.card, margin: 16, borderRadius: 20, padding: 20,
          boxShadow: '0 8px 32px rgba(23,17,10,0.10)',
          opacity: interpolate(contentS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(contentS, [0, 1], [24, 0])}px)`,
        }}>
          <p style={{ fontFamily: BRAND.fontS, fontSize: 14, lineHeight: '22px', color: '#6B5246', marginBottom: 16 }}>
            The beating heart of Marrakech — a UNESCO-listed square where snake charmers, storytellers, and food stalls create a living theatre unlike anywhere on earth.
          </p>

          <div style={{ height: 1, background: BRAND.border, margin: '16px 0' }} />

          <div style={{ fontFamily: BRAND.fontS, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: BRAND.primary, textTransform: 'uppercase', marginBottom: 8 }}>
            Cultural Story
          </div>
          <p style={{ fontFamily: BRAND.fontS, fontSize: 13, lineHeight: '20px', color: BRAND.dark }}>
            Once a medieval execution ground, Jemaa el-Fna transformed into a marketplace of oral tradition. Every evening at sunset, Gnawa musicians begin their hypnotic rhythms — carrying centuries of sub-Saharan heritage through the crowd.
          </p>

          <div style={{ height: 1, background: BRAND.border, margin: '16px 0' }} />

          <div style={{ display: 'flex', gap: 12 }}>
            {[{ label: 'BEST TIME', value: 'After sunset' }, { label: 'RARITY', value: '55 · Known' }].map(item => (
              <div key={item.label} style={{ flex: 1, background: BRAND.accent, borderRadius: 14, padding: '12px 14px' }}>
                <div style={{ fontFamily: BRAND.fontS, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: BRAND.primary, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: BRAND.fontS, fontSize: 13, fontWeight: 600, color: BRAND.dark }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="Discover" />
    </Phone>
  )
}
