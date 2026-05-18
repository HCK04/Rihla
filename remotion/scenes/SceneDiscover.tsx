import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion'
import { Phone, BRAND } from '../components/Phone'
import { BottomNav } from '../components/BottomNav'
import { RarityBadge } from '../components/RarityBadge'

const SPOTS = [
  {
    name: 'Jemaa el-Fna', category: 'Culture', rarity: 55,
    img: 'https://images.unsplash.com/photo-1500462918725-6fdc92a2571a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mellah Jewish Quarter', category: 'Medina', rarity: 78,
    img: 'https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Le Jardin Secret', category: 'Nature', rarity: 83,
    img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
  },
]

const PILLS = ['All', 'Culture', 'Food', 'Nature', 'Medina']

export const SceneDiscover: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headerY = spring({ frame: Math.max(0, frame), fps, config: { damping: 20, stiffness: 90 } })
  const headerO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const scrollY = interpolate(frame, [60, 240], [0, -220], { extrapolateRight: 'clamp' })

  return (
    <Phone>
      {/* Header */}
      <div style={{
        padding: '52px 20px 16px',
        borderBottom: `0.5px solid ${BRAND.border}`,
        opacity: headerO,
        transform: `translateY(${interpolate(headerY, [0, 1], [-24, 0])}px)`,
      }}>
        <div style={{ fontFamily: BRAND.fontD, fontSize: 34, fontWeight: 700, color: BRAND.dark, letterSpacing: '-0.01em' }}>
          Discover
        </div>
        <div style={{ fontFamily: BRAND.fontS, fontSize: 14, color: BRAND.muted, marginTop: 4 }}>
          Hidden gems across Morocco
        </div>
        {/* Pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {PILLS.map((c, i) => {
            const pillO = interpolate(frame, [10 + i * 5, 28 + i * 5], [0, 1], { extrapolateRight: 'clamp' })
            return (
              <div key={c} style={{
                padding: '6px 14px', borderRadius: 9999, flexShrink: 0,
                background: i === 0 ? BRAND.primary : 'rgba(255,255,255,0.80)',
                border: `1px solid ${i === 0 ? 'transparent' : BRAND.border}`,
                fontFamily: BRAND.fontS, fontSize: 12, fontWeight: 600,
                color: i === 0 ? '#FFF' : BRAND.muted,
                opacity: pillO,
              }}>{c}</div>
            )
          })}
        </div>
      </div>

      {/* Spot cards with scroll */}
      <div style={{
        padding: '16px 20px',
        transform: `translateY(${scrollY}px)`,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {SPOTS.map((spot, i) => {
          const delay = 18 + i * 16
          const cardO = interpolate(frame, [delay, delay + 22], [0, 1], { extrapolateRight: 'clamp' })
          const cardY = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 18, stiffness: 85 } })
          return (
            <div key={spot.name} style={{
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(23,17,10,0.13)',
              opacity: cardO,
              transform: `translateY(${interpolate(cardY, [0, 1], [36, 0])}px)`,
              height: 200, position: 'relative', background: '#1a0800',
              flexShrink: 0,
            }}>
              <Img src={spot.img} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 30%, rgba(12,7,3,0.86) 100%)',
              }} />
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <RarityBadge score={spot.rarity} dark />
              </div>
              <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                <div style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 9999, marginBottom: 6,
                  background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(6px)',
                  border: '0.5px solid rgba(255,255,255,0.18)',
                  fontFamily: BRAND.fontS, fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.10em', color: '#FFF', textTransform: 'uppercase',
                }}>{spot.category}</div>
                <div style={{ fontFamily: BRAND.fontD, fontSize: 20, fontWeight: 700, color: '#FFF' }}>{spot.name}</div>
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav active="Discover" />
    </Phone>
  )
}
