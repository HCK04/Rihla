'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, Plus, Check, Gem } from 'lucide-react'
import { RarityBadge } from '@/components/shared/RarityBadge'
import { getRarityDescription } from '@/lib/utils'
import { useLang, pick } from '@/lib/language-context'
import { getSpotImage, getCategoryFallback } from '@/data/spot-images'
import { isSpotSaved, toggleSavedSpot } from '@/lib/saved-spots'
import marrakechSpots from '@/data/spots/marrakech.json'
import fezSpots from '@/data/spots/fez.json'
import casablancaSpots from '@/data/spots/casablanca.json'
import rabatSpots from '@/data/spots/rabat.json'
import tangierSpots from '@/data/spots/tangier.json'
import agadirSpots from '@/data/spots/agadir.json'
import type { Spot } from '@/lib/types'

const ALL_SPOTS = [
  ...marrakechSpots, ...fezSpots, ...casablancaSpots,
  ...rabatSpots, ...tangierSpots, ...agadirSpots,
] as Spot[]

const CATEGORY_COLORS: Record<string, string> = {
  culture: '#9B3B0A', food: '#6B4C00', nature: '#2A5C3F',
  medina: '#6B2200', market: '#4A2E5C', hammam: '#1A5858',
  cafe: '#4C3214', museum: '#1A3C5C', mosque: '#341A5C', viewpoint: '#263E0A',
}

export default function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLang()
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [imgFailed, setImgFailed] = useState(false)
  const [saved, setSaved] = useState(false)

  const spot = ALL_SPOTS.find(s => s.id === id)

  useEffect(() => {
    if (spot) {
      setSaved(isSpotSaved(spot.id))
      setImgSrc(getSpotImage(spot.id, spot.category))
    }
  }, [spot])

  if (!spot) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: '#FAF7F2' }}>
        <p style={{ fontFamily: 'var(--font-sans)', color: '#8C6E60' }}>Spot not found</p>
      </div>
    )
  }

  const catColor    = CATEGORY_COLORS[spot.category] ?? '#6B2200'
  const name        = pick(spot.name as Record<string, string>, lang)
  const description = pick(spot.description as Record<string, string>, lang)
  const story       = pick((spot.culturalStory ?? {}) as Record<string, string>, lang)
  const cityLabel   = spot.city.charAt(0).toUpperCase() + spot.city.slice(1)

  return (
    <div className="min-h-dvh" style={{ background: '#FAF7F2' }}>
      {/* Hero */}
      <div className="relative h-80 overflow-hidden" style={{ background: '#1A1209' }}>
        {imgSrc && !imgFailed && (
          <img
            src={imgSrc}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => {
              // Wikimedia failed — try Unsplash category fallback
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
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 35%, rgba(15,8,3,0.80) 100%)',
          }}
        />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute left-5 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            top: 'calc(3rem + env(safe-area-inset-top, 0px))',
            background: 'rgba(0,0,0,0.36)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '0.5px solid rgba(255,255,255,0.18)',
          }}
        >
          <ArrowLeft size={18} color="#FFFFFF" strokeWidth={2} />
        </button>

        {/* Bottom content over hero */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <span
            className="inline-block mb-2 uppercase"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.10em',
              color: '#FFFFFF',
              background: 'rgba(0,0,0,0.40)',
              backdropFilter: 'blur(6px)',
              border: '0.5px solid rgba(255,255,255,0.22)',
              padding: '3px 10px', borderRadius: 9999,
            }}
          >
            {spot.category}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px', fontWeight: 700, lineHeight: '34px',
              letterSpacing: '-0.01em', color: '#FFFFFF', marginBottom: 4,
            }}
          >
            {name}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.70)' }}>
            {cityLabel}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5 flex flex-col gap-5">

        {/* Rarity card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 p-4 rounded-2xl"
          style={{ background: '#FFFFFF', boxShadow: '0 4px 20px rgba(23,17,10,0.07)' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#FEF3EE' }}
          >
            <Gem size={20} color="#6B2200" strokeWidth={1.75} />
          </div>
          <div>
            <RarityBadge score={spot.rarity} size="md" />
            <p className="mt-1.5" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#6B5246', lineHeight: '18px' }}>
              {getRarityDescription(spot.rarity)}
            </p>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: '26px', color: '#6B5246' }}
        >
          {description}
        </motion.p>

        {/* Cultural story */}
        {story && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl"
            style={{ background: '#FFFFFF', boxShadow: '0 4px 20px rgba(23,17,10,0.07)' }}
          >
            <p
              className="mb-3 uppercase"
              style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.10em', color: catColor }}
            >
              Cultural Story
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: '23px', color: '#17110A' }}>
              {story}
            </p>
          </motion.div>
        )}

        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3"
        >
          {[
            { icon: <Clock size={14} strokeWidth={1.75} />, label: 'Best time',  value: spot.bestTime },
            { icon: <MapPin size={14} strokeWidth={1.75} />, label: 'Distance', value: `${spot.distanceFromCenter.toFixed(1)} km from centre` },
          ].map(item => (
            <div
              key={item.label}
              className="flex-1 p-3 rounded-xl flex items-center gap-2"
              style={{ background: '#FFFFFF', boxShadow: '0 2px 10px rgba(23,17,10,0.06)' }}
            >
              <span style={{ color: catColor }}>{item.icon}</span>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#8C6E60', textTransform: 'uppercase' }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: '#17110A', marginTop: 2 }}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {spot.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
                background: '#EAE6DF', color: '#6B5246',
                padding: '4px 12px', borderRadius: 9999, letterSpacing: '0.02em',
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            const next = toggleSavedSpot({
              id: spot.id,
              name: typeof spot.name === 'string' ? spot.name : (spot.name as Record<string, string>).en,
              city: spot.city,
              category: spot.category,
              rarity: spot.rarity,
              bestTime: spot.bestTime,
              description: typeof spot.description === 'string' ? spot.description : (spot.description as Record<string, string>).en,
              source: 'spot',
            })
            setSaved(next)
          }}
          className="w-full flex items-center justify-center gap-2"
          style={{
            height: 58, borderRadius: 18,
            background: saved ? '#2A5C3F' : '#6B2200',
            boxShadow: saved ? '0 8px 28px rgba(42,92,63,0.28)' : '0 8px 28px rgba(107,34,0,0.32)',
            fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600,
            color: '#FFFFFF', letterSpacing: '0.02em',
            transition: 'background 0.25s, box-shadow 0.25s',
          }}
        >
          {saved ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2} />}
          {saved ? 'Saved to Plan' : 'Add to My Plan'}
        </motion.button>
      </div>
    </div>
  )
}
