import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from 'remotion'
import { BRAND } from '../components/Phone'

export const SceneSplash: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const logoO  = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
  const logoY  = spring({ frame: Math.max(0, frame), fps, config: { damping: 16, stiffness: 70 } })
  const subO   = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: 'clamp' })
  const btnO   = interpolate(frame, [65, 90], [0, 1], { extrapolateRight: 'clamp' })
  const btnY   = spring({ frame: Math.max(0, frame - 65), fps, config: { damping: 16, stiffness: 90 } })

  return (
    <div style={{ width: 393, height: 852, position: 'relative', overflow: 'hidden' }}>
      {/* Moroccan background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #2A0800 0%, #5C1A00 35%, #8C3200 65%, #1A0500 100%)',
      }} />

      {/* Zellige pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: [
          'repeating-linear-gradient(45deg, #F7D060 0px, #F7D060 1px, transparent 1px, transparent 24px)',
          'repeating-linear-gradient(-45deg, #F7D060 0px, #F7D060 1px, transparent 1px, transparent 24px)',
        ].join(', '),
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '22%', left: '50%',
        transform: 'translateX(-50%)',
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,208,96,0.14) 0%, transparent 70%)',
      }} />

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(12,7,3,0.18) 0%, transparent 28%, transparent 44%, rgba(12,7,3,0.82) 74%, rgba(12,7,3,0.97) 100%)',
      }} />

      {/* Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 28px 64px' }}>
        {/* Logo */}
        <div style={{
          opacity: logoO,
          transform: `translateY(${interpolate(logoY, [0, 1], [32, 0])}px)`,
          marginBottom: 12,
        }}>
          <Img src="/logo.png" style={{ height: 64, width: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* Tagline */}
        <div style={{
          opacity: subO, marginBottom: 38,
          fontFamily: BRAND.fontS, fontSize: 15, fontWeight: 300,
          color: 'rgba(255,255,255,0.65)', letterSpacing: '0.06em',
        }}>
          Morocco, as locals know it.
        </div>

        {/* CTA button */}
        <div style={{
          opacity: btnO,
          transform: `translateY(${interpolate(btnY, [0, 1], [18, 0])}px)`,
          background: BRAND.primary, borderRadius: 18, height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 36px rgba(107,34,0,0.55)',
          fontFamily: BRAND.fontS, fontSize: 16, fontWeight: 600,
          color: '#FFF', letterSpacing: '0.02em', gap: 8,
        }}>
          Begin your journey  ›
        </div>
      </div>
    </div>
  )
}
