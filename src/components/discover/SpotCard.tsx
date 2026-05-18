'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, MapPin } from 'lucide-react'
import { RarityBadge } from '@/components/shared/RarityBadge'
import { getSpotImage, getCategoryFallback } from '@/data/spot-images'
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
}

export function SpotCard({ spot, index = 0, lang = 'en' }: SpotCardProps) {
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
          className="rounded-3xl overflow-hidden active:scale-[0.982] transition-transform duration-200"
          style={{ background: '#FFFFFF', boxShadow: '0 2px 0 rgba(217,184,168,0.28), 0 14px 40px rgba(23,17,10,0.09)' }}
        >
          {/* Hero image */}
          <div className="relative h-52 overflow-hidden" style={{ background: catBg }}>
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
                  : 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 40%, rgba(0,0,0,0.32) 100%)',
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
                background: imgFailed ? `${catColor}14` : 'rgba(0,0,0,0.36)',
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
          <div className="px-5 pt-4 pb-4">
            <h3
              className="line-clamp-1 mb-1.5"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '19px',
                fontWeight: 600,
                lineHeight: '25px',
                color: '#17110A',
                letterSpacing: '-0.01em',
              }}
            >
              {name}
            </h3>
            <p
              className="line-clamp-2 mb-4"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 400,
                lineHeight: '20px',
                color: '#6B5246',
              }}
            >
              {description}
            </p>
            <div className="zellige-divider mb-3.5" />
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#8C6E60' }}>
                <Clock size={11} strokeWidth={1.75} />
                {spot.bestTime}
              </span>
              <span className="flex items-center gap-1.5" style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#8C6E60' }}>
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
