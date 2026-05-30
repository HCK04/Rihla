'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Clock, Heart, MapPin, Navigation, Plus, Sparkles } from 'lucide-react'
import { RihlaFAB } from '@/components/navigation/RihlaFAB'
import { RarityBadge } from '@/components/ui/RarityBadge'
import { RihlaButton } from '@/components/ui/RihlaButton'
import { ZelligeDivider } from '@/components/ui/ZelligeDivider'
import { getRarityDescription } from '@/lib/utils'
import { pick, useLang } from '@/lib/language-context'
import { t } from '@/lib/i18n'
import { getCategoryFallback, getSpotImage } from '@/content/spot-images'
import { isSpotSaved, toggleSavedSpot } from '@/lib/saved-spots'
import marrakechSpots from '@/content/spots/marrakech.json'
import fezSpots from '@/content/spots/fez.json'
import casablancaSpots from '@/content/spots/casablanca.json'
import rabatSpots from '@/content/spots/rabat.json'
import tangierSpots from '@/content/spots/tangier.json'
import agadirSpots from '@/content/spots/agadir.json'
import type { Spot } from '@/lib/types'

const ALL_SPOTS = [
  ...marrakechSpots,
  ...fezSpots,
  ...casablancaSpots,
  ...rabatSpots,
  ...tangierSpots,
  ...agadirSpots,
] as Spot[]

const CITY_LABELS: Record<string, string> = {
  casablanca: 'Casablanca',
  marrakech: 'Marrakech',
  rabat: 'Rabat',
  tangier: 'Tangier',
  agadir: 'Agadir',
  fez: 'Fez',
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

  const nearby = useMemo(() => {
    if (!spot) return []
    return ALL_SPOTS
      .filter(candidate => candidate.city === spot.city && candidate.id !== spot.id)
      .sort((a, b) => b.rarity - a.rarity)
      .slice(0, 2)
  }, [spot])

  if (!spot) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0F0E0C] px-6 text-center">
        <p className="text-[15px] text-[#B9AD9B]">This gem slipped out of view.</p>
      </div>
    )
  }

  const name = pick(spot.name as Record<string, string>, lang)
  const description = pick(spot.description as Record<string, string>, lang)
  const story = pick((spot.culturalStory ?? {}) as Record<string, string>, lang)
  const cityLabel = CITY_LABELS[spot.city] ?? spot.city

  const saveSpot = () => {
    const next = toggleSavedSpot({
      id: spot.id,
      name: (spot.name as Record<string, string>).en,
      city: spot.city,
      category: spot.category,
      rarity: spot.rarity,
      bestTime: spot.bestTime,
      description: (spot.description as Record<string, string>).en,
      source: 'spot',
    })
    setSaved(next)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([10, 50, 10])
  }

  return (
    <main className="min-h-dvh bg-[#0F0E0C] pb-[calc(106px+env(safe-area-inset-bottom,0px))] text-[#F0E8D8]">
      <section className="relative h-[55dvh] min-h-[410px] overflow-hidden bg-[#1A1209]">
        {imgSrc && !imgFailed && (
          <img
            src={imgSrc}
            alt={`${name} in ${cityLabel}`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => {
              const fallback = getCategoryFallback(spot.category)
              if (imgSrc !== fallback) setImgSrc(fallback)
              else setImgFailed(true)
            }}
          />
        )}
        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,14,12,0.25)_0%,rgba(15,14,12,0.08)_38%,rgba(15,14,12,0.98)_100%)]" />

        <button
          onClick={() => router.back()}
          className="absolute left-5 top-[calc(3rem+env(safe-area-inset-top,0px))] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-xl"
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
        </button>

        <div className="absolute right-5 top-[calc(3rem+env(safe-area-inset-top,0px))]">
          <RarityBadge score={spot.rarity} size="md" dark />
        </div>

        <div className="absolute bottom-10 left-0 right-0 px-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
            <span className="mb-3 inline-flex rounded-full border border-[#E8A838]/28 bg-black/38 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-[#E8A838] backdrop-blur">
              {spot.category}
            </span>
            <h1 className="max-w-[18rem] text-[34px] font-semibold leading-[38px] text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {name}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[13px] text-white/70">
              <MapPin size={13} strokeWidth={1.7} />
              {cityLabel} · Morocco · {spot.distanceFromCenter.toFixed(1)} km
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 -mt-8 rounded-t-[28px] border-t border-[#E8A838]/20 bg-[#0F0E0C] px-5 pt-4">
        <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-[#786858]" />

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rihla-card overflow-hidden rounded-2xl p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#E8A838]/20 bg-[#E8A838]/10 text-[#E8A838]">
              <Sparkles size={21} strokeWidth={1.6} />
            </div>
            <div>
              <RarityBadge score={spot.rarity} size="md" />
              <p className="mt-2 text-[13px] leading-5 text-[#B8A898]">{getRarityDescription(spot.rarity)}</p>
            </div>
          </div>
        </motion.div>

        <article className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">{t(lang, 'story')}</p>
          <p className="mt-3 text-[16px] leading-7 text-[#D9CCB7]">{story || description}</p>
        </article>

        <ZelligeDivider className="my-6" />

        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">{t(lang, 'why_special')}</p>
          <div className="mt-3 space-y-3">
            {[
              `Rarity score ${spot.rarity} means this is not the usual guidebook stop.`,
              `${spot.reviewCount} reviews and ${spot.photoCount} photos give enough signal without feeling overrun.`,
              `${cityLabel} locals know the timing matters: ${spot.bestTime}.`,
            ].map(item => (
              <div key={item} className="flex gap-3 text-[14px] leading-6 text-[#D9CCB7]">
                <Sparkles className="mt-1 flex-shrink-0 text-[#E8A838]" size={13} strokeWidth={1.8} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <ZelligeDivider className="my-6" />

        <section className="grid grid-cols-2 gap-3">
          {[
            { icon: <Clock size={15} strokeWidth={1.7} />, label: t(lang, 'scan_best_time_label'), value: spot.bestTime },
            { icon: <Navigation size={15} strokeWidth={1.7} />, label: t(lang, 'getting_there'), value: `${spot.distanceFromCenter.toFixed(1)} km` },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8A838]/10 text-[#E8A838]">
                {item.icon}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-[#786858]">{item.label}</p>
              <p className="mt-1 text-[13px] leading-5 text-[#F0E8D8]">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">{t(lang, 'darija_helper')}</p>
          <p className="mt-3 text-right text-[20px] text-[#F0E8D8]" style={{ fontFamily: 'var(--font-arabic)' }}>
            فين كاين {name}؟
          </p>
          <p className="mt-2 text-[13px] leading-5 text-[#B8A898]">“Where is {name}?” Show this when asking nearby.</p>
        </section>

        {nearby.length > 0 && (
          <>
            <ZelligeDivider className="my-6" />
            <section>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">{t(lang, 'nearby_gems')}</p>
              <div className="grid grid-cols-2 gap-3">
                {nearby.map(item => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/spot/${item.id}`)}
                    className="rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] p-3 text-left active:scale-[0.98]"
                  >
                    <p className="line-clamp-2 text-[15px] font-semibold leading-5 text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>
                      {pick(item.name as Record<string, string>, lang)}
                    </p>
                    <div className="mt-2">
                      <RarityBadge score={item.rarity} size="sm" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-[240] border-t border-[#E8A838]/18 bg-[#0F0E0C]/92 px-5 pb-[calc(16px+env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur-2xl">
        <div className="flex gap-3">
          <RihlaButton
            className="h-14 flex-1 text-[15px]"
            icon={saved ? <Check size={17} strokeWidth={2.2} /> : <Plus size={17} strokeWidth={1.8} />}
            onClick={saveSpot}
          >
            {saved ? t(lang, 'added_to_my_day') : t(lang, 'add_to_my_day')}
          </RihlaButton>
          <RihlaButton
            variant="secondary"
            className="h-14 w-14 px-0"
            aria-label="Keep this one"
            icon={<Heart size={18} fill={saved ? '#E8A838' : 'none'} color={saved ? '#E8A838' : '#D9CCB7'} />}
            onClick={saveSpot}
          />
        </div>
      </div>

      <RihlaFAB />
    </main>
  )
}
