'use client'

import { Gem } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn, getRarityDescription, getRarityLabel } from '@/lib/utils'

interface RarityBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  dark?: boolean
  animated?: boolean
  className?: string
}

export function RarityBadge({
  score,
  size = 'md',
  showDescription = false,
  dark = false,
  animated = true,
  className,
}: RarityBadgeProps) {
  const { label } = getRarityLabel(score)
  const description = getRarityDescription(score)
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score)
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setDisplayScore(score)
      return
    }

    let frame = 0
    const start = performance.now()
    const duration = 600
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(score * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animated, score])

  const sizes = {
    sm: { icon: 10, text: '10px', padding: '3px 9px', gap: 4 },
    md: { icon: 12, text: '12px', padding: '4px 11px', gap: 5 },
    lg: { icon: 14, text: '13px', padding: '5px 13px', gap: 6 },
  }
  const s = sizes[size]

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
          background: dark ? 'rgba(15,14,12,0.56)' : 'rgba(232,168,56,0.13)',
          border: dark ? '0.5px solid rgba(232,168,56,0.34)' : '1px solid rgba(232,168,56,0.34)',
          backdropFilter: dark ? 'blur(8px)' : 'none',
          WebkitBackdropFilter: dark ? 'blur(8px)' : 'none',
          color: '#E8A838',
        }}
      >
        <Gem size={s.icon} strokeWidth={1.75} />
        <span>{displayScore}</span>
        <span style={{ opacity: 0.58 }}>Rarity</span>
        <span>{label}</span>
      </div>
      {showDescription && (
        <p className="mt-1" style={{ fontSize: '11px', color: '#B9AD9B', fontFamily: 'var(--font-sans)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
