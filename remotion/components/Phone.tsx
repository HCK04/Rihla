import React from 'react'

export const BRAND = {
  bg:        '#FAF7F2',
  primary:   '#6B2200',
  dark:      '#17110A',
  muted:     '#8C6E60',
  card:      '#FFFFFF',
  border:    'rgba(217,184,168,0.35)',
  gold:      '#F7D060',
  accent:    '#FEF3EE',
  fontD:     'Georgia, serif',          // display (Playfair fallback)
  fontS:     'system-ui, sans-serif',  // sans (Plus Jakarta fallback)
}

export const Phone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 393, height: 852,
    background: BRAND.bg,
    overflow: 'hidden',
    position: 'relative',
    fontFamily: BRAND.fontS,
  }}>
    {children}
  </div>
)
