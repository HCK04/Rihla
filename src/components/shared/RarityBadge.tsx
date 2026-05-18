'use client'

import { Gem } from 'lucide-react'
import { getRarityLabel, getRarityDescription } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RarityBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  dark?: boolean
  className?: string
}

export function RarityBadge({
  score, size = 'md', showDescription = false, dark = false, className,
}: RarityBadgeProps) {
  const { label, color } = getRarityLabel(score)
  const description = getRarityDescription(score)

  const sizes = {
    sm: { icon: 10, text: '10px', padding: '3px 9px',  gap: 4 },
    md: { icon: 12, text: '12px', padding: '4px 11px', gap: 5 },
    lg: { icon: 14, text: '13px', padding: '5px 13px', gap: 6 },
  }
  const s = sizes[size]

  const badgeStyle = dark
    ? {
        background: 'rgba(0,0,0,0.42)',
        border: '0.5px solid rgba(255,255,255,0.22)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: '#FFFFFF',
      }
    : {
        background: `${color}16`,
        border: `1px solid ${color}38`,
        color,
      }

  return (
    <div className={cn('flex flex-col', className)}>
      <div
        className="inline-flex items-center rounded-full font-semibold"
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: s.text,
          padding: s.padding,
          gap: s.gap,
          letterSpacing: '0.02em',
          ...badgeStyle,
        }}
      >
        <Gem size={s.icon} strokeWidth={1.75} />
        <span>{score}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>{label}</span>
      </div>
      {showDescription && (
        <p className="mt-1" style={{ fontSize: '11px', color: '#6B5246', fontFamily: 'var(--font-sans)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
