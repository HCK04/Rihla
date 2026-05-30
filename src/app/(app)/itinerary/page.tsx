'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, Bookmark, ChevronLeft, ChevronRight, Coffee, Compass, Landmark, MapPinned, Moon, Search, Share2, ShoppingBag, Sparkles, Sun, Utensils, X } from 'lucide-react'
import { RihlaFAB } from '@/components/navigation/RihlaFAB'
import { RarityBadge } from '@/components/ui/RarityBadge'
import { RihlaButton } from '@/components/ui/RihlaButton'
import { ZelligeDivider } from '@/components/ui/ZelligeDivider'
import { flagUrl } from '@/content/flag-codes'
import { getSavedSpots, removeSavedSpot, type SavedSpot } from '@/lib/saved-spots'
import { t } from '@/lib/i18n'
import { useLang } from '@/lib/language-context'
import teams from '@/content/teams/wc2030.json'
import marrakechSpots from '@/content/spots/marrakech.json'
import fezSpots from '@/content/spots/fez.json'
import casablancaSpots from '@/content/spots/casablanca.json'
import rabatSpots from '@/content/spots/rabat.json'
import tangierSpots from '@/content/spots/tangier.json'
import agadirSpots from '@/content/spots/agadir.json'

const ALL_SPOTS = [
  ...marrakechSpots,
  ...fezSpots,
  ...casablancaSpots,
  ...rabatSpots,
  ...tangierSpots,
  ...agadirSpots,
]

const CITY_LABELS: Record<string, string> = {
  casablanca: 'Casablanca',
  marrakech: 'Marrakech',
  rabat: 'Rabat',
  tangier: 'Tangier',
  agadir: 'Agadir',
  fez: 'Fez',
}

const TIME_ICONS: Record<string, React.ReactNode> = {
  Morning: <Coffee size={14} strokeWidth={1.75} />,
  Afternoon: <Sun size={14} strokeWidth={1.75} />,
  Evening: <Moon size={14} strokeWidth={1.75} />,
}

interface ItinerarySlot {
  time?: string
  activity?: string
  spot?: string
  spotId?: string
  rarityScore?: number
}

interface ItineraryDay {
  day: number
  label?: string
  theme?: string
  slots: ItinerarySlot[]
}

type Team = typeof teams[0]

const STORAGE_KEY = 'rihlai_saved_itinerary'

const INTEREST_OPTIONS = [
  { id: 'food', label: 'Food', detail: 'Markets, local kitchens, cafes', icon: Utensils },
  { id: 'culture', label: 'Culture', detail: 'Museums, craft, architecture', icon: Landmark },
  { id: 'hidden-gems', label: 'Hidden gems', detail: 'Less obvious local places', icon: Sparkles },
  { id: 'shopping', label: 'Shopping', detail: 'Souks, makers, match souvenirs', icon: ShoppingBag },
]

const PACE_OPTIONS = ['Relaxed', 'Balanced', 'Packed']
const BUDGET_OPTIONS = ['Street-smart', 'Mid-range', 'Comfort']
const MATCH_TIME_OPTIONS = ['Afternoon kickoff', 'Evening kickoff', 'Late kickoff']
const POSITION_OPTIONS = ['Near stadium', 'City center base', 'Medina stay', 'Easy transit']

interface PlannerPreferences {
  interests: string[]
  pace: string
  budget: string
  matchTime: string
  stadiumPosition: string
}

const DEFAULT_PREFERENCES: PlannerPreferences = {
  interests: ['food', 'hidden-gems'],
  pace: 'Balanced',
  budget: 'Mid-range',
  matchTime: 'Evening kickoff',
  stadiumPosition: 'Easy transit',
}

function resolveSpotId(spotId: string | undefined, spotText: string, city: string): string | null {
  if (spotId && ALL_SPOTS.find(s => s.id === spotId)) return spotId
  const citySpots = ALL_SPOTS.filter(s => s.city === city)
  const spotName = spotText.split(' - ')[0].toLowerCase().trim()
  const match = citySpots.find(s => {
    const name = (s.name as Record<string, string>).en.toLowerCase()
    return name.includes(spotName) || spotName.includes(name)
  })
  return match?.id ?? null
}

function splitSpotText(text: string) {
  const normalized = text.replaceAll(' - ', ' -- ')
  const [name, ...rest] = normalized.split(' -- ')
  return { name, reason: rest.join(' -- ') || null }
}

function ItineraryContent() {
  const { lang } = useLang()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [savedSpots, setSavedSpots] = useState<SavedSpot[]>([])
  const [preferences, setPreferences] = useState<PlannerPreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { team, days, preferences: savedPreferences } = JSON.parse(saved)
        setSelectedTeam(team)
        setItinerary(days)
        if (savedPreferences) setPreferences(savedPreferences)
      }
    } catch {}
    setSavedSpots(getSavedSpots())
  }, [])

  const filteredTeams = teams.filter(team => team.name.toLowerCase().includes(search.toLowerCase()))

  const chooseTeam = (team: Team) => {
    setSelectedTeam(team)
    setError(null)
    setItinerary(null)
  }

  const toggleInterest = (id: string) => {
    setPreferences(prev => {
      const interests = prev.interests.includes(id)
        ? prev.interests.filter(interest => interest !== id)
        : [...prev.interests, id]
      return { ...prev, interests: interests.length ? interests : [id] }
    })
  }

  const generateItinerary = async () => {
    if (!selectedTeam) return
    setLoading(true)
    setError(null)
    setItinerary(null)
    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: selectedTeam.city,
          teamName: selectedTeam.name,
          teamCode: selectedTeam.code,
          days: 3,
          lang,
          preferences,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const days = data.days ?? []
      setItinerary(days)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ team: selectedTeam, days, preferences }))
    } catch {
      setError("The medina WiFi is inconsistent. Reconnect and I'll pick up where we left off.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const code = searchParams.get('team')
    if (code && !selectedTeam && !itinerary) {
      const team = teams.find(t => t.code === code)
      if (team) chooseTeam(team)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleReset = () => {
    setItinerary(null)
    setSelectedTeam(null)
    setError(null)
    setPreferences(DEFAULT_PREFERENCES)
    localStorage.removeItem(STORAGE_KEY)
  }

  if (loading && selectedTeam) {
    return (
      <main className="rihla-screen flex min-h-dvh flex-col items-center justify-center gap-7 px-8 text-center">
        <img src={flagUrl(selectedTeam.code)} alt={selectedTeam.name} width={84} height={56} className="rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.28)]" />
        <div>
          <p className="text-[28px] font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>{t(lang, 'asking_locals')}</p>
          <p className="mt-2 text-[14px] leading-6 text-[#B8A898]">
            {t(lang, 'curating_prefix')} {CITY_LABELS[selectedTeam.city]}.
          </p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-2 w-2 animate-bounce rounded-full bg-[#C4622D]" style={{ animationDelay: `${i * 130}ms` }} />
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="rihla-screen flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C4622D]/30 bg-[#C4622D]/10">
          <AlertCircle size={26} color="#C4622D" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[22px] font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>{t(lang, 'still_here')}</p>
          <p className="mt-2 text-[14px] leading-6 text-[#B8A898]">{error}</p>
        </div>
        <RihlaButton onClick={handleReset}>{t(lang, 'try_once_more')}</RihlaButton>
      </main>
    )
  }

  if (itinerary && selectedTeam) {
    return (
      <main className="rihla-screen min-h-dvh pb-8">
        <RihlaFAB />
        <header className="sticky top-0 z-30 border-b border-[#E8A838]/18 bg-[#0F0E0C]/90 px-5 pb-4 pt-safe-12 backdrop-blur-2xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#E8A838]">{t(lang, 'match_day_planner')}</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <img src={flagUrl(selectedTeam.code)} alt={selectedTeam.name} width={42} height={28} className="rounded-md object-cover shadow-[0_4px_14px_rgba(0,0,0,0.28)]" />
              <div className="min-w-0">
                <h1 className="truncate text-[25px] font-semibold leading-7 text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>{selectedTeam.name}</h1>
                <p className="text-[13px] text-[#B8A898]">3 days · {CITY_LABELS[selectedTeam.city]}</p>
              </div>
            </div>
            <button className="flex h-10 items-center gap-2 rounded-full border border-[#E8A838]/24 bg-[#E8A838]/10 px-3 text-[13px] font-semibold text-[#E8A838]">
              <Share2 size={13} strokeWidth={1.8} />
              {t(lang, 'share')}
            </button>
          </div>
        </header>

        <div className="px-5 py-5">
          <div className="mb-6 rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">{t(lang, 'flexible_plan_title')}</p>
            <p className="mt-2 text-[14px] leading-6 text-[#B8A898]">
              {t(lang, 'flexible_plan_body')}
            </p>
          </div>

          <div className="space-y-7">
            {itinerary.map((day, dayIndex) => (
              <motion.section key={day.day} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dayIndex * 0.08 }}>
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#C4622D] text-white shadow-[0_8px_24px_rgba(196,98,45,0.24)]">
                    <span className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{day.day}</span>
                  </div>
                  <div>
                    <h2 className="text-[21px] font-semibold leading-6 text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>{day.label}</h2>
                    {day.theme && <p className="mt-1 text-[12px] italic leading-5 text-[#B8A898]">{day.theme}</p>}
                  </div>
                </div>

                <div className="relative ml-5 space-y-3 border-l border-[#E8A838]/18 pl-5">
                  {day.slots.map((slot, slotIndex) => {
                    const spotText = slot.spot ?? slot.activity ?? ''
                    const resolvedId = resolveSpotId(slot.spotId, spotText, selectedTeam.city)
                    const { name, reason } = splitSpotText(spotText)
                    return (
                      <button
                        key={`${day.day}-${slotIndex}`}
                        onClick={() => resolvedId && router.push(`/spot/${resolvedId}`)}
                        className="relative w-full rounded-2xl border border-[#E8A838]/16 bg-[#1A1815] p-4 text-left shadow-[0_8px_30px_rgba(0,0,0,0.20)] active:scale-[0.99]"
                      >
                        <span className="absolute -left-[28px] top-5 h-3 w-3 rounded-full border-2 border-[#0F0E0C] bg-[#E8A838]" />
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#E8A838]/10 text-[#E8A838]">
                            {TIME_ICONS[slot.time ?? ''] ?? <Coffee size={14} strokeWidth={1.75} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#E8A838]">{slot.time}</p>
                            <p className="mt-1 text-[14px] font-semibold text-[#F0E8D8]">{slot.activity}</p>
                            <p className="mt-1 text-[13px] font-semibold leading-5 text-[#D9CCB7]">{name}</p>
                            {reason && <p className="mt-1 text-[12px] leading-5 text-[#B8A898]">{reason}</p>}
                          </div>
                          <div className="flex flex-shrink-0 flex-col items-end gap-2">
                            {slot.rarityScore != null && <RarityBadge score={slot.rarityScore} size="sm" />}
                            <ChevronRight size={14} color={resolvedId ? '#E8A838' : '#786858'} />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.section>
            ))}
          </div>

          {savedSpots.length > 0 && (
            <>
              <ZelligeDivider className="my-6" />
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <Bookmark size={15} color="#E8A838" strokeWidth={2} />
                  <h2 className="text-[19px] font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>{t(lang, 'kept_for_later')}</h2>
                </div>
                <div className="space-y-2">
                  {savedSpots.map(spot => (
                    <div key={spot.id} className="flex items-start gap-3 rounded-2xl border border-[#E8A838]/16 bg-[#1A1815] p-4">
                      <Bookmark size={15} color="#E8A838" strokeWidth={1.8} className="mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-[#F0E8D8]">{spot.name}</p>
                        <p className="mt-1 text-[12px] leading-5 text-[#B8A898]">{spot.description.length > 86 ? `${spot.description.slice(0, 86)}...` : spot.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          removeSavedSpot(spot.id)
                          setSavedSpots(getSavedSpots())
                        }}
                        className="p-1 text-[#786858]"
                        aria-label={`Remove ${spot.name}`}
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          <button
            onClick={handleReset}
            className="mt-7 h-13 min-h-[52px] w-full rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] text-[14px] font-semibold text-[#D9CCB7]"
          >
            {t(lang, 'change_team')}
          </button>
        </div>
      </main>
    )
  }

  if (selectedTeam) {
    return (
      <main className="rihla-screen min-h-dvh pb-8">
        <RihlaFAB />
        <div className="rihla-zellige pointer-events-none absolute inset-0 opacity-[0.035]" />
        <header className="relative px-5 pb-5 pt-safe-12">
          <button
            type="button"
            onClick={() => setSelectedTeam(null)}
            className="mb-5 flex h-10 items-center gap-2 rounded-full border border-[#E8A838]/18 bg-[#1A1815] px-3 text-[13px] font-semibold text-[#D9CCB7]"
          >
            <ChevronLeft size={15} strokeWidth={1.8} />
            Team
          </button>

          <div className="flex items-center gap-3">
            <img src={flagUrl(selectedTeam.code)} alt={selectedTeam.name} width={48} height={32} className="rounded-lg object-cover shadow-[0_6px_18px_rgba(0,0,0,0.28)]" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">Customize before planning</p>
              <h1 className="truncate text-[34px] font-semibold leading-[38px] text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>
                {selectedTeam.name} in {CITY_LABELS[selectedTeam.city]}
              </h1>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-6 text-[#B8A898]">
            Rihla will craft the plan around your travel style, match timing, and where you want to be positioned on match day.
          </p>
        </header>

        <section className="relative px-5">
          <div className="rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.20)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8A838]/12 text-[#E8A838]">
                <Compass size={18} strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>What should the route favor?</h2>
                <p className="mt-0.5 text-[12px] text-[#B8A898]">Pick one or more. The plan will prioritize these.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INTEREST_OPTIONS.map(option => {
                const active = preferences.interests.includes(option.id)
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleInterest(option.id)}
                    className="min-h-[112px] rounded-2xl border p-4 text-left transition active:scale-[0.98]"
                    style={{
                      background: active ? '#C4622D' : '#0F0E0C',
                      borderColor: active ? 'rgba(232,168,56,0.48)' : 'rgba(232,168,56,0.16)',
                      boxShadow: active ? '0 12px 32px rgba(196,98,45,0.24)' : 'none',
                    }}
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                      <Icon size={17} strokeWidth={1.8} />
                    </div>
                    <p className="text-[14px] font-semibold text-[#F5EFE6]">{option.label}</p>
                    <p className="mt-1 text-[11px] leading-4 text-[#D9CCB7] opacity-80">{option.detail}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="relative mt-4 space-y-4 px-5">
          <div className="rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] p-4">
            <h2 className="mb-3 text-[18px] font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>Travel comfort</h2>
            <div className="space-y-3">
              {[
                { label: 'Pace', key: 'pace' as const, options: PACE_OPTIONS },
                { label: 'Budget', key: 'budget' as const, options: BUDGET_OPTIONS },
              ].map(group => (
                <div key={group.key}>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">{group.label}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {group.options.map(option => {
                      const active = preferences[group.key] === option
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setPreferences(prev => ({ ...prev, [group.key]: option }))}
                          className="min-h-[44px] rounded-xl border px-2 text-[12px] font-semibold transition active:scale-[0.98]"
                          style={{
                            background: active ? '#E8A838' : '#0F0E0C',
                            borderColor: active ? '#E8A838' : 'rgba(232,168,56,0.16)',
                            color: active ? '#17110A' : '#D9CCB7',
                          }}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] p-4">
            <h2 className="mb-3 text-[18px] font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>Match logistics</h2>
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">Schedule</p>
                <div className="grid grid-cols-1 gap-2">
                  {MATCH_TIME_OPTIONS.map(option => {
                    const active = preferences.matchTime === option
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPreferences(prev => ({ ...prev, matchTime: option }))}
                        className="flex min-h-[44px] items-center justify-between rounded-xl border px-3 text-left text-[13px] font-semibold transition active:scale-[0.98]"
                        style={{
                          background: active ? 'rgba(232,168,56,0.12)' : '#0F0E0C',
                          borderColor: active ? 'rgba(232,168,56,0.48)' : 'rgba(232,168,56,0.16)',
                          color: active ? '#F5EFE6' : '#D9CCB7',
                        }}
                      >
                        {option}
                        {active && <Sun size={15} color="#E8A838" strokeWidth={1.9} />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">Position</p>
                <div className="grid grid-cols-2 gap-2">
                  {POSITION_OPTIONS.map(option => {
                    const active = preferences.stadiumPosition === option
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPreferences(prev => ({ ...prev, stadiumPosition: option }))}
                        className="min-h-[50px] rounded-xl border px-3 text-[12px] font-semibold transition active:scale-[0.98]"
                        style={{
                          background: active ? '#C4622D' : '#0F0E0C',
                          borderColor: active ? 'rgba(232,168,56,0.48)' : 'rgba(232,168,56,0.16)',
                          color: active ? '#FFFFFF' : '#D9CCB7',
                        }}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={generateItinerary}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#C4622D] text-[15px] font-semibold text-white shadow-[0_12px_32px_rgba(196,98,45,0.28)] active:scale-[0.98]"
          >
            Craft my personalized plan
            <ChevronRight size={17} strokeWidth={1.9} />
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="rihla-screen min-h-dvh pb-8">
      <RihlaFAB />
      <div className="rihla-zellige pointer-events-none absolute inset-0 opacity-[0.035]" />
      <header className="relative px-5 pb-4 pt-safe-12">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">{t(lang, 'world_cup_mode')}</p>
        <h1 className="text-[36px] font-semibold leading-[40px] text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>
          {t(lang, 'team_rooting')}
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[#B8A898]">{t(lang, 'itinerary_subtitle')}</p>
        <div className="relative mt-5">
          <Search size={15} color="#B8A898" strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t(lang, 'search_team')}
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="h-12 w-full rounded-2xl border border-[#E8A838]/20 bg-[#1A1815] pl-10 pr-4 text-[15px] text-[#F0E8D8] outline-none placeholder:text-[#786858]"
          />
        </div>
      </header>

      <div className="relative grid grid-cols-2 gap-3 px-5 py-4">
        {filteredTeams.map((team, index) => (
          <motion.button
            key={team.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => chooseTeam(team)}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[#E8A838]/16 bg-[#1A1815] px-3 py-5 text-center shadow-[0_8px_30px_rgba(0,0,0,0.20)]"
          >
            <img src={flagUrl(team.code)} alt={team.name} width={44} height={29} className="rounded object-cover shadow-[0_4px_14px_rgba(0,0,0,0.24)]" />
            <span className="text-[13px] font-semibold leading-[17px] text-[#F0E8D8]">{team.name}</span>
            <span className="rounded-full border border-[#E8A838]/22 bg-[#E8A838]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#E8A838]">
              {CITY_LABELS[team.city]}
            </span>
          </motion.button>
        ))}
      </div>
    </main>
  )
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="rihla-screen min-h-dvh" />}>
      <ItineraryContent />
    </Suspense>
  )
}
