'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, MapPin } from 'lucide-react'
import { RarityBadge } from '@/components/ui/RarityBadge'
import { getSpotImage, getCategoryFallback } from '@/content/spot-images'
import { pick } from '@/lib/language-context'
import type { Spot } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  culture:   '#9B3B0A', food:      '#6B4C00', nature:    '#2A5C3F',
  medina:    '#6B2200', market:    '#4A2E5C', hammam:    '#1A5858',
  cafe:      '#4C3214', museum:    '#1A3C5C', mosque:    '#341A5C', viewpoint: '#263E0A',
}

const CATEGORY_BG: Record<string, string> = {
  culture:   '#FEF3EE', food:      '#FFFDF0', nature:    '#EEF7F1',
  medina:    '#FFF4EE', market:    '#F7F2FF', hammam:    '#EEFAFA',
  cafe:      '#FAF4EE', museum:    '#EEF3FA', mosque:    '#F4EEFC', viewpoint: '#F1F7E8',
}

interface SpotCardProps {
  spot: Spot
  index?: number
  lang?: string
  compact?: boolean
}

export function SpotCard({ spot, index = 0, lang = 'en', compact = false }: SpotCardProps) {
  const [imgSrc, setImgSrc] = useState(() => getSpotImage(spot.id, spot.category))
  const [imgFailed, setImgFailed] = useState(false)
  const name = pick(spot.name as Record<string, string>, lang as 'en')
  const description = pick(spot.description as Record<string, string>, lang as 'en')
  const catColor = CATEGORY_COLORS[spot.category] ?? '#6B2200'
  const catBg    = CATEGORY_BG[spot.category]    ?? '#FEF3EE'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link href={`/spot/${spot.id}`}>
        <div
          className="overflow-hidden rounded-2xl border border-[#E8A838]/20 bg-[#1A1815] active:scale-[0.980] transition-transform duration-200"
          style={{
            boxShadow: '0 8px 32px rgba(196,98,45,0.15)',
          }}
        >
          {/* Hero image */}
          <div className={`relative overflow-hidden ${compact ? 'h-44' : 'h-56'}`} style={{ background: catBg }}>
            {!imgFailed && (
              <img
                src={imgSrc}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onError={() => {
                  const fallback = getCategoryFallback(spot.category)
                  if (imgSrc !== fallback) {
                    setImgSrc(fallback)
                  } else {
                    setImgFailed(true)
                  }
                }}
              />
            )}

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: imgFailed
                  ? 'transparent'
                  : 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, transparent 38%, rgba(0,0,0,0.52) 100%)',
              }}
            />

            {/* Category chip */}
            <span
              className="absolute top-3 left-3 uppercase"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.10em',
                  color: imgFailed ? catColor : '#FFFFFF',
                  background: imgFailed ? `${catColor}14` : 'rgba(15,14,12,0.52)',
                backdropFilter: imgFailed ? 'none' : 'blur(6px)',
                border: imgFailed ? `1px solid ${catColor}28` : '0.5px solid rgba(255,255,255,0.25)',
                padding: '3px 9px',
                borderRadius: 9999,
              }}
            >
              {spot.category}
            </span>

            {/* Rarity badge */}
            <div className="absolute bottom-3 right-3">
              <RarityBadge score={spot.rarity} size="sm" dark={!imgFailed} />
            </div>

            {/* Watermark score (only when fully failed) */}
            {imgFailed && (
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 select-none pointer-events-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '5.5rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  color: catColor,
                  opacity: 0.06,
                }}
              >
                {spot.rarity}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="px-4 pt-3.5 pb-4">
            <h3
              className="line-clamp-1 mb-1.5"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: compact ? '19px' : '21px',
                fontWeight: 600,
                lineHeight: '27px',
                color: '#F5EFE6',
                letterSpacing: '-0.01em',
              }}
            >
              {name}
            </h3>
            <p
              className="line-clamp-2 mb-3.5"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 400,
                lineHeight: '20px',
                color: '#B9AD9B',
              }}
            >
              {description}
            </p>
            <div className="zellige-divider mb-3" />
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#B9AD9B' }}>
                <Clock size={11} strokeWidth={1.75} />
                {spot.bestTime}
              </span>
              <span className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#B9AD9B' }}>
                <MapPin size={11} strokeWidth={1.75} />
                {spot.distanceFromCenter.toFixed(1)} km
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
