import React from 'react'
import { BRAND } from './Phone'

const NAV = [
  { label: 'Discover', icon: '◈' },
  { label: 'Chat',     icon: '◎' },
  { label: 'Scan',     icon: '⊕' },
  { label: 'Plan',     icon: '☰' },
]

export const BottomNav: React.FC<{ active?: string }> = ({ active = 'Discover' }) => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 80,
    background: 'rgba(250,247,242,0.92)',
    borderTop: '0.5px solid rgba(217,184,168,0.30)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    paddingBottom: 16,
  }}>
    {NAV.map(n => (
      <div key={n.label} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 20, color: n.label === active ? BRAND.primary : BRAND.muted }}>{n.icon}</span>
        <span style={{
          fontSize: 10, fontWeight: n.label === active ? 700 : 400,
          color: n.label === active ? BRAND.primary : BRAND.muted,
          letterSpacing: '0.02em',
        }}>{n.label}</span>
        {n.label === active && (
          <div style={{ width: 18, height: 2, borderRadius: 1, background: BRAND.primary, marginTop: -2 }} />
        )}
      </div>
    ))}
  </div>
)
