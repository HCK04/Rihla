import React from 'react'
import { BRAND } from './Phone'

const label = (s: number) => s >= 80 ? 'Hidden' : s >= 60 ? 'Local' : s >= 40 ? 'Known' : 'Popular'
const color = (s: number) => s >= 80 ? '#4B1040' : s >= 60 ? BRAND.primary : '#5B4000'

export const RarityBadge: React.FC<{ score: number; dark?: boolean }> = ({ score, dark }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', borderRadius: 9999,
    background: dark ? 'rgba(0,0,0,0.42)' : BRAND.accent,
    border: dark ? '0.5px solid rgba(255,255,255,0.20)' : `1px solid ${color(score)}40`,
  }}>
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: dark ? '#FFF' : color(score) }}>
      {label(score)} · {score}
    </span>
  </div>
)
