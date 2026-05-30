'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Coffee, Gem, MapPin, Search, Sparkles, Utensils } from 'lucide-react'
import { SpotCard } from '@/features/discover/components/SpotCard'
import { useLang } from '@/lib/language-context'
import { t } from '@/lib/i18n'
import marrakechSpots from '@/content/spots/marrakech.json'
import fezSpots from '@/content/spots/fez.json'
import casablancaSpots from '@/content/spots/casablanca.json'
import rabatSpots from '@/content/spots/rabat.json'
import tangierSpots from '@/content/spots/tangier.json'
import agadirSpots from '@/content/spots/agadir.json'
import type { City, Spot } from '@/lib/types'

const ALL_SPOTS = [
  ...marrakechSpots,
  ...fezSpots,
  ...casablancaSpots,
  ...rabatSpots,
  ...tangierSpots,
  ...agadirSpots,
] as Spot[]

const CITY_LABELS: Record<City | 'all', string> = {
  all: 'Morocco',
  marrakech: 'Marrakech',
  fez: 'Fez',
  casablanca: 'Casablanca',
  rabat: 'Rabat',
  tangier: 'Tangier',
  agadir: 'Agadir',
}

const CITY_IDS: (City | 'all')[] = ['marrakech', 'fez', 'casablanca', 'rabat', 'tangier', 'agadir', 'all']

function Lane({
  title,
  icon,
  spots,
  lang,
}: {
  title: string
  icon: ReactNode
  spots: Spot[]
  lang: string
}) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8A838]/20 bg-[#E8A838]/10 text-[#E8A838]">
            {icon}
          </span>
          <h2 className="text-[18px] font-semibold text-[#F5EFE6]" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7A7060]">{spots.length}</span>
      </div>

      <div className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-none">
        {spots.slice(0, 8).map((spot, index) => (
          <div key={spot.id} className="w-[82vw] max-w-[330px] flex-shrink-0">
            <SpotCard spot={spot} index={index} lang={lang} compact />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function DiscoverPage() {
  const { lang } = useLang()
  const [city, setCity] = useState<City | 'all'>('marrakech')
  const [headerHidden, setHeaderHidden] = useState(false)
  const lastScrollY = useRef(0)

  const citySpots = useMemo(
    () => ALL_SPOTS.filter(spot => city === 'all' || spot.city === city),
    [city]
  )
  const hiddenGems = [...citySpots].sort((a, b) => b.rarity - a.rarity)
  const foodSpots = citySpots.filter(spot => spot.category === 'food' || spot.category === 'cafe')
  const matchDaySpots = citySpots.filter(spot => ['culture', 'market', 'medina', 'viewpoint'].includes(spot.category))

  useEffect(() => {
    lastScrollY.current = window.scrollY

    const onScroll = () => {
      const current = window.scrollY
      const delta = current - lastScrollY.current

      if (current < 40) {
        setHeaderHidden(false)
      } else if (delta > 8) {
        setHeaderHidden(true)
      } else if (delta < -8) {
        setHeaderHidden(false)
      }

      lastScrollY.current = current
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="rihla-screen min-h-dvh pb-6">
      <div
        className="sticky top-0 z-30 border-b border-[#E8A838]/15 bg-[#0F0E0C]/88 px-5 pb-4 pt-safe-12 backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: headerHidden ? 'translateY(calc(-100% + env(safe-area-inset-top, 0px) + 8px))' : 'translateY(0)',
          boxShadow: headerHidden ? 'none' : '0 14px 42px rgba(0,0,0,0.22)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">Rihla</p>
            <h1 className="mt-1 text-[30px] font-semibold leading-none text-[#F5EFE6]" style={{ fontFamily: 'var(--font-display)' }}>
              {t(lang, 'discovery_title')}
            </h1>
          </div>
          <button className="flex h-10 items-center gap-1.5 rounded-full border border-[#E8A838]/20 bg-[#1A1815] px-3 text-[12px] font-semibold text-[#F5EFE6]">
            <MapPin size={13} color="#E8A838" strokeWidth={1.7} />
            {CITY_LABELS[city]}
          </button>
        </div>

        <Link
          href="/chat"
          className="mt-4 flex h-13 min-h-[52px] items-center gap-3 rounded-2xl border border-[#E8A838]/20 bg-[#1A1815] px-4 shadow-[0_8px_32px_rgba(196,98,45,0.12)]"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#C4622D]">
            <Sparkles size={15} color="#fff" strokeWidth={1.6} />
            <span className="absolute inset-[-4px] rounded-full border border-[#C4622D]/40 animate-ping" />
          </span>
          <span className="flex-1 text-[15px] text-[#B9AD9B]">{t(lang, 'ask_morocco')}</span>
          <Search size={16} color="#E8A838" strokeWidth={1.6} />
        </Link>

        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 scrollbar-none">
          {CITY_IDS.map(id => (
            <button
              key={id}
              onClick={() => setCity(id)}
              className="h-9 flex-shrink-0 rounded-full border px-4 text-[13px] font-semibold transition-colors"
              style={{
                background: city === id ? '#C4622D' : '#1A1815',
                borderColor: city === id ? 'rgba(232,168,56,0.45)' : 'rgba(232,168,56,0.16)',
                color: city === id ? '#FFFFFF' : '#B9AD9B',
              }}
            >
              {CITY_LABELS[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="rihla-card overflow-hidden rounded-2xl p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#E8A838]">{t(lang, 'marhaba')}</p>
          <p className="mt-2 text-[16px] leading-6 text-[#D9CCB7]">
            {t(lang, 'discovery_intro')}
          </p>
        </div>
      </div>

      <Lane title={t(lang, 'hidden_near_you')} icon={<Gem size={16} strokeWidth={1.5} />} spots={hiddenGems} lang={lang} />
      <Lane title={t(lang, 'match_day_guide')} icon={<Sparkles size={16} strokeWidth={1.5} />} spots={matchDaySpots} lang={lang} />
      <Lane title={t(lang, 'eat_like_local')} icon={<Utensils size={16} strokeWidth={1.5} />} spots={foodSpots.length ? foodSpots : hiddenGems} lang={lang} />

      <div className="px-5 pb-3 pt-6">
        <Link
          href="/itinerary"
          className="flex h-14 items-center justify-center gap-2 rounded-lg bg-[#C4622D] text-[15px] font-semibold text-white shadow-[0_12px_36px_rgba(196,98,45,0.28)]"
        >
          <Coffee size={17} strokeWidth={1.7} />
          {t(lang, 'build_my_day')}
        </Link>
      </div>
    </main>
  )
}
