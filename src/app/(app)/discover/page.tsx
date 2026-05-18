'use client'

import { useState } from 'react'
import { Gem } from 'lucide-react'
import { SpotCard } from '@/components/discover/SpotCard'
import { useLang } from '@/lib/language-context'
import { t } from '@/lib/i18n'
import marrakechSpots from '@/data/spots/marrakech.json'
import fezSpots from '@/data/spots/fez.json'
import casablancaSpots from '@/data/spots/casablanca.json'
import rabatSpots from '@/data/spots/rabat.json'
import tangierSpots from '@/data/spots/tangier.json'
import agadirSpots from '@/data/spots/agadir.json'
import type { Spot } from '@/lib/types'

const ALL_SPOTS = [
  ...marrakechSpots,
  ...fezSpots,
  ...casablancaSpots,
  ...rabatSpots,
  ...tangierSpots,
  ...agadirSpots,
] as Spot[]

const CITY_IDS = ['all', 'marrakech', 'fez', 'casablanca', 'rabat', 'tangier', 'agadir']
const CITY_FIXED_LABELS: Record<string, string> = {
  marrakech: 'Marrakech', fez: 'Fez', casablanca: 'Casablanca',
  rabat: 'Rabat', tangier: 'Tangier', agadir: 'Agadir',
}

const CATEGORY_IDS = ['all', 'culture', 'food', 'nature', 'medina', 'market', 'museum', 'cafe']

export default function DiscoverPage() {
  const { lang } = useLang()
  const [city, setCity] = useState('all')
  const [category, setCategory] = useState('all')
  const [hiddenGemsOnly, setHiddenGemsOnly] = useState(false)

  const filtered = ALL_SPOTS.filter(s => {
    if (city !== 'all' && s.city !== city) return false
    if (category !== 'all' && s.category !== category) return false
    if (hiddenGemsOnly && s.rarity < 70) return false
    return true
  }).sort((a, b) => b.rarity - a.rarity)

  return (
    <div className="min-h-dvh" style={{ background: '#faf8f4' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 safe-top"
        style={{ background: 'rgba(250,249,245,0.95)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(44,62,80,0.08)' }}
      >
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '40px',
                fontWeight: 700,
                lineHeight: '44px',
                letterSpacing: '-0.01em',
                color: '#18191a',
              }}
            >
              {t(lang, 'discover')}
            </h1>

            {/* Hidden gems toggle */}
            <button
              onClick={() => setHiddenGemsOnly(!hiddenGemsOnly)}
              className="flex items-center gap-2 transition-all duration-200"
              style={{
                height: 36,
                paddingLeft: 14,
                paddingRight: 14,
                borderRadius: 9999,
                background: hiddenGemsOnly ? '#fff3ef' : '#efeeea',
                border: `1px solid ${hiddenGemsOnly ? '#c64f00' : '#e3e2df'}`,
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 600,
                color: hiddenGemsOnly ? '#8c3500' : '#594238',
                letterSpacing: '0.03em',
              }}
            >
              <Gem size={12} strokeWidth={1.75} />
              {t(lang, 'hidden_gems')}
            </button>
          </div>

          {/* City pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
            {CITY_IDS.map(id => (
              <button
                key={id}
                onClick={() => setCity(id)}
                className="whitespace-nowrap flex-shrink-0 transition-all duration-150"
                style={{
                  height: 34,
                  paddingLeft: 14,
                  paddingRight: 14,
                  borderRadius: 9999,
                  background: city === id ? '#8c3500' : '#ffffff',
                  border: `1px solid ${city === id ? '#8c3500' : '#e3e2df'}`,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: city === id ? 600 : 500,
                  color: city === id ? '#ffffff' : '#594238',
                  boxShadow: city === id ? '0 4px 12px rgba(158,61,0,0.20)' : 'none',
                }}
              >
                {id === 'all' ? t(lang, 'all_cities') : CITY_FIXED_LABELS[id]}
              </button>
            ))}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none mt-2">
            {CATEGORY_IDS.map(id => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className="whitespace-nowrap flex-shrink-0 transition-all duration-150"
                style={{
                  height: 30,
                  paddingLeft: 12,
                  paddingRight: 12,
                  borderRadius: 9999,
                  background: category === id ? '#fff3ef' : 'transparent',
                  border: `1px solid ${category === id ? '#c64f00' : '#e0c0b2'}`,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: category === id ? '#8c3500' : '#8c7166',
                  letterSpacing: '0.02em',
                }}
              >
                {id === 'all' ? t(lang, 'all_categories') : t(lang, `cat_${id}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="px-5 py-3">
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#8c7166' }}>
          {filtered.length} {filtered.length !== 1 ? t(lang, 'all_spots').toLowerCase() : t(lang, 'all_spots').toLowerCase().replace(/s$/, '')}
          {hiddenGemsOnly && ` · ${t(lang, 'hidden_gems')}`}
        </p>
      </div>

      {/* Cards */}
      <div className="px-5 pb-6 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Gem size={36} strokeWidth={1.5} className="mx-auto mb-3" style={{ color: '#e0c0b2' }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: '#8c7166' }}>
              No spots match your filters
            </p>
          </div>
        ) : (
          filtered.map((spot, i) => (
            <SpotCard key={spot.id} spot={spot} index={i} lang={lang} />
          ))
        )}
      </div>
    </div>
  )
}
