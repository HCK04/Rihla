import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion'
import { Phone, BRAND } from '../components/Phone'
import { BottomNav } from '../components/BottomNav'
import { RarityBadge } from '../components/RarityBadge'

const DAYS = [
  {
    day: 1, label: 'Arrival & Discovery',
    slots: [
      { time: 'Morning',   activity: 'Coffee & pastries', spot: "Café des Épices",   rarity: 62 },
      { time: 'Afternoon', activity: 'Wander the medina', spot: 'Jemaa el-Fna',      rarity: 55 },
      { time: 'Evening',   activity: 'Rooftop dinner',   spot: 'Nomad Restaurant',   rarity: 71 },
    ],
  },
  {
    day: 2, label: 'Deep Morocco',
    slots: [
      { time: 'Morning',   activity: 'Tanneries visit',  spot: 'Chouara Tannery',    rarity: 68 },
      { time: 'Afternoon', activity: 'Hidden gardens',   spot: 'Le Jardin Secret',   rarity: 83 },
      { time: 'Evening',   activity: 'Night market',     spot: 'Rahba Kedima',       rarity: 76 },
    ],
  },
]

const TIME_ICONS: Record<string, string> = { Morning: '☕', Afternoon: '☀', Evening: '☽' }

export const SceneItinerary: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headerO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const headerY = spring({ frame: Math.max(0, frame), fps, config: { damping: 20, stiffness: 90 } })
  const scrollY = interpolate(frame, [50, 270], [0, -340], { extrapolateRight: 'clamp' })

  return (
    <Phone>
      {/* Header */}
      <div style={{
        padding: '52px 20px 16px', borderBottom: `0.5px solid ${BRAND.border}`,
        opacity: headerO,
        transform: `translateY(${interpolate(headerY, [0, 1], [-20, 0])}px)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Img src="https://flagcdn.com/w80/ma.png"
              style={{ width: 40, height: 26, objectFit: 'cover', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }} />
            <div>
              <div style={{ fontFamily: BRAND.fontD, fontSize: 20, fontWeight: 700, color: BRAND.dark }}>Morocco</div>
              <div style={{ fontFamily: BRAND.fontS, fontSize: 13, color: BRAND.muted }}>3 days · Marrakech</div>
            </div>
          </div>
          <div style={{
            height: 36, padding: '0 14px', borderRadius: 9999,
            background: BRAND.gold, border: `1px solid #DFB200`,
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: BRAND.fontS, fontSize: 13, fontWeight: 600, color: '#3C2E00',
          }}>⬆ Share</div>
        </div>
      </div>

      {/* Days */}
      <div style={{
        padding: '16px 20px 80px', display: 'flex', flexDirection: 'column', gap: 22,
        transform: `translateY(${scrollY}px)`,
      }}>
        {DAYS.map((day, di) => {
          const dayDelay = 14 + di * 10
          const dayO = interpolate(frame, [dayDelay, dayDelay + 20], [0, 1], { extrapolateRight: 'clamp' })
          const dayY = spring({ frame: Math.max(0, frame - dayDelay), fps, config: { damping: 18, stiffness: 85 } })
          return (
            <div key={day.day} style={{
              opacity: dayO,
              transform: `translateY(${interpolate(dayY, [0, 1], [22, 0])}px)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 10, background: BRAND.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: BRAND.fontS, fontSize: 13, fontWeight: 700, color: '#FFF',
                }}>{day.day}</div>
                <div style={{ fontFamily: BRAND.fontD, fontSize: 17, fontWeight: 700, color: BRAND.dark }}>{day.label}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {day.slots.map((slot, si) => {
                  const slotDelay = dayDelay + 10 + si * 8
                  const slotO = interpolate(frame, [slotDelay, slotDelay + 18], [0, 1], { extrapolateRight: 'clamp' })
                  const slotY = spring({ frame: Math.max(0, frame - slotDelay), fps, config: { damping: 18, stiffness: 90 } })
                  return (
                    <div key={si} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
                      borderRadius: 18, background: BRAND.card,
                      boxShadow: '0 4px 20px rgba(23,17,10,0.07)',
                      opacity: slotO,
                      transform: `translateY(${interpolate(slotY, [0, 1], [14, 0])}px)`,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, background: BRAND.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, flexShrink: 0,
                      }}>{TIME_ICONS[slot.time]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: BRAND.fontS, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: BRAND.primary, marginBottom: 2, textTransform: 'uppercase' }}>
                          {slot.time}
                        </div>
                        <div style={{ fontFamily: BRAND.fontS, fontSize: 13, fontWeight: 600, color: BRAND.dark, marginBottom: 2 }}>
                          {slot.activity}
                        </div>
                        <div style={{ fontFamily: BRAND.fontS, fontSize: 12, color: '#6B5246' }}>{slot.spot}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                        <RarityBadge score={slot.rarity} />
                        <span style={{ color: BRAND.primary, fontSize: 14 }}>›</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav active="Plan" />
    </Phone>
  )
}
