'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Share2, Coffee, Sun, Moon, ChevronRight, AlertCircle, Search, Bookmark, X } from 'lucide-react'
import { RarityBadge } from '@/components/shared/RarityBadge'
import { useLang } from '@/lib/language-context'
import { t } from '@/lib/i18n'
import { flagUrl } from '@/data/flag-codes'
import { getSavedSpots, removeSavedSpot, type SavedSpot } from '@/lib/saved-spots'
import teams from '@/data/teams/wc2030.json'
import marrakechSpots from '@/data/spots/marrakech.json'
import fezSpots from '@/data/spots/fez.json'
import casablancaSpots from '@/data/spots/casablanca.json'
import rabatSpots from '@/data/spots/rabat.json'
import tangierSpots from '@/data/spots/tangier.json'
import agadirSpots from '@/data/spots/agadir.json'

const ALL_SPOTS = [
  ...marrakechSpots, ...fezSpots, ...casablancaSpots,
  ...rabatSpots, ...tangierSpots, ...agadirSpots,
]

function resolveSpotId(spotId: string | undefined, spotText: string, city: string): string | null {
  if (spotId && ALL_SPOTS.find(s => s.id === spotId)) return spotId
  const citySpots = ALL_SPOTS.filter(s => s.city === city)
  const spotName = spotText.split(' — ')[0].toLowerCase().trim()
  const match = citySpots.find(s =>
    (s.name as Record<string, string>).en.toLowerCase().includes(spotName) ||
    spotName.includes((s.name as Record<string, string>).en.toLowerCase())
  )
  return match?.id ?? null
}

const CITY_LABELS: Record<string, string> = {
  casablanca: 'Casablanca', marrakech: 'Marrakech',
  rabat: 'Rabat', tangier: 'Tangier', agadir: 'Agadir', fez: 'Fez',
}

const TIME_ICONS: Record<string, React.ReactNode> = {
  Morning:   <Coffee   size={14} strokeWidth={1.75} />,
  Afternoon: <Sun      size={14} strokeWidth={1.75} />,
  Evening:   <Moon     size={14} strokeWidth={1.75} />,
}

interface ItinerarySlot  { time?: string; activity?: string; spot?: string; spotId?: string; rarityScore?: number }
interface ItineraryDay   { day: number; label?: string; theme?: string; slots: ItinerarySlot[] }
type Team = typeof teams[0]

const STORAGE_KEY = 'rihlai_saved_itinerary'

function ItineraryContent() {
  const { lang } = useLang()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [loading, setLoading]     = useState(false)
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [savedSpots, setSavedSpots] = useState<SavedSpot[]>([])

  // Restore persisted itinerary + saved spots on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { team, days } = JSON.parse(saved)
        setSelectedTeam(team)
        setItinerary(days)
      }
    } catch {}
    setSavedSpots(getSavedSpots())
  }, [])

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const generateItinerary = async (team: Team) => {
    setSelectedTeam(team)
    setLoading(true)
    setError(null)
    setItinerary(null)
    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: team.city, teamName: team.name,
          teamCode: team.code, days: 3, lang,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const days = data.days ?? []
      setItinerary(days)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ team, days }))
    } catch {
      setError("Couldn't generate your itinerary — check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate when arriving from onboarding with ?team=CODE (only if nothing saved)
  useEffect(() => {
    const code = searchParams.get('team')
    if (code && !selectedTeam && !itinerary) {
      const team = teams.find(t => t.code === code)
      if (team) generateItinerary(team)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleReset = () => {
    setItinerary(null)
    setSelectedTeam(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  /* ── Loading ── */
  if (loading && selectedTeam) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-8 px-8 relative" style={{ background: '#FAF7F2' }}>
        <div className="absolute inset-0 zellige-bg pointer-events-none opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center gap-6"
        >
          <img
            src={flagUrl(selectedTeam.code)}
            alt={selectedTeam.name}
            width={84} height={56}
            className="rounded-xl object-cover"
            style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.22)' }}
          />
          <div className="text-center">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: '#17110A', marginBottom: 6, letterSpacing: '-0.01em' }}>
              {t(lang, 'crafting')}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#8C6E60', lineHeight: '20px' }}>
              {t(lang, 'curating_prefix')} {CITY_LABELS[selectedTeam.city]}
            </p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: '#6B2200', animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-5 px-6" style={{ background: '#FAF7F2' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: '#FFF0F0', border: '1px solid #FFDAD6' }}>
          <AlertCircle size={26} color="#BA1A1A" strokeWidth={1.75} />
        </div>
        <div className="text-center">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#17110A', marginBottom: 8 }}>{t(lang, 'something_went_wrong')}</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#8C6E60' }}>{error}</p>
        </div>
        <button onClick={handleReset} style={{
          height: 52, paddingLeft: 32, paddingRight: 32, borderRadius: 16,
          background: '#6B2200', boxShadow: '0 6px 24px rgba(107,34,0,0.28)',
          fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: '#FFFFFF',
        }}>{t(lang, 'try_again')}</button>
      </div>
    )
  }

  /* ── Itinerary view ── */
  if (itinerary && selectedTeam) {
    return (
      <div className="min-h-dvh" style={{ background: '#FAF7F2' }}>
        <div className="px-5 pb-4 pt-safe-12" style={{ borderBottom: '0.5px solid rgba(217,184,168,0.28)' }}>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600,
            letterSpacing: '0.12em', color: '#9B6E58', textTransform: 'uppercase', marginBottom: 8,
          }}>
            Your Itinerary
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={flagUrl(selectedTeam.code)}
                alt={selectedTeam.name}
                width={40} height={27}
                className="rounded-md object-cover"
                style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.20)' }}
              />
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#17110A', lineHeight: '28px', letterSpacing: '-0.01em' }}>
                  {selectedTeam.name}
                </h1>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#8C6E60' }}>
                  3 {t(lang, 'days_unit')} · {CITY_LABELS[selectedTeam.city]}
                </p>
              </div>
            </div>
            <button style={{
              height: 38, paddingLeft: 14, paddingRight: 14, borderRadius: 9999,
              background: '#F7D060', border: '1px solid #DFB200',
              boxShadow: '0 4px 14px rgba(197,162,0,0.22)',
              fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: '#3C2E00',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Share2 size={13} strokeWidth={2} />{t(lang, 'share')}
            </button>
          </div>
        </div>

        <div className="px-5 py-5 flex flex-col gap-6 pb-8">
          {itinerary.map((day, di) => (
            <motion.div key={day.day} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.1 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #6B2200 0%, #9B3B0A 100%)',
                    boxShadow: '0 4px 14px rgba(107,34,0,0.28)',
                  }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#FFF' }}>{day.day}</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#17110A', lineHeight: '24px' }}>{day.label}</h3>
                  {day.theme && (
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#8C6E60', fontStyle: 'italic', marginTop: 2 }}>
                      {day.theme}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2.5 mt-3">
                {day.slots.map((slot, si) => {
                  const spotText = slot.spot ?? slot.activity ?? ''
                  const resolvedId = resolveSpotId(slot.spotId, spotText, selectedTeam!.city)
                  const spotName = spotText.split(' — ')[0]
                  const spotReason = spotText.includes(' — ') ? spotText.split(' — ').slice(1).join(' — ') : null
                  return (
                  <button key={si}
                    onClick={() => resolvedId && router.push(`/spot/${resolvedId}`)}
                    className="flex items-start gap-3 p-4 rounded-2xl text-left w-full active:scale-[0.98] transition-transform duration-150"
                    style={{
                      background: '#FFFFFF',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(23,17,10,0.07)',
                      cursor: resolvedId ? 'pointer' : 'default',
                    }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: '#FEF3EE', color: '#6B2200' }}>
                      {TIME_ICONS[slot.time ?? ''] ?? <Coffee size={14} strokeWidth={1.75} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="mb-0.5 uppercase" style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#6B2200' }}>
                        {slot.time}
                      </p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: '#17110A', marginBottom: 3 }}>
                        {slot.activity}
                      </p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: '#3D2318', lineHeight: '18px' }}>
                        {spotName}
                      </p>
                      {spotReason && (
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#8C6E60', lineHeight: '17px', marginTop: 2 }}>
                          {spotReason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {slot.rarityScore != null && <RarityBadge score={slot.rarityScore} size="sm" />}
                      <ChevronRight size={14} color={resolvedId ? '#6B2200' : '#D9B8A8'} />
                    </div>
                  </button>
                  )
                })}
              </div>
            </motion.div>
          ))}

          {savedSpots.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-3">
                <Bookmark size={15} color="#6B2200" strokeWidth={2} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#17110A' }}>
                  Saved Spots
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {savedSpots.map(spot => (
                  <div key={spot.id} className="flex items-start gap-3 p-4 rounded-2xl"
                    style={{ background: '#FFFFFF', boxShadow: '0 4px 20px rgba(23,17,10,0.07)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: '#FEF3EE', color: '#6B2200' }}>
                      <Bookmark size={14} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: '#17110A', marginBottom: 2 }}>
                        {spot.name}
                      </p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#8C6E60', lineHeight: '17px' }}>
                        {spot.description.length > 80 ? spot.description.slice(0, 80) + '…' : spot.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <RarityBadge score={spot.rarity} size="sm" />
                      <button onClick={() => {
                        removeSavedSpot(spot.id)
                        setSavedSpots(getSavedSpots())
                      }} style={{ color: '#D9B8A8', padding: 2 }}>
                        <X size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <button onClick={handleReset} style={{
            width: '100%', height: 52, borderRadius: 16,
            background: 'rgba(234,230,223,0.80)',
            fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: '#8C6E60',
          }}>
            {t(lang, 'change_team')}
          </button>
        </div>
      </div>
    )
  }

  /* ── Team picker ── */
  return (
    <div className="min-h-dvh relative" style={{ background: '#FAF7F2' }}>
      <div className="absolute inset-0 zellige-bg pointer-events-none opacity-40" />

      <div className="relative px-5 pb-4 pt-safe-12" style={{ borderBottom: '0.5px solid rgba(217,184,168,0.30)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: '#17110A', marginBottom: 6, letterSpacing: '-0.01em' }}>
          {t(lang, 'plan')}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#8C6E60', marginBottom: 16 }}>
          {t(lang, 'itinerary_subtitle')}
        </p>
        <div className="relative">
          <Search size={15} color="#8C6E60" strokeWidth={1.75} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder={t(lang, 'search_team')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full outline-none"
            style={{
              height: 48, paddingLeft: 40, paddingRight: 16,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.80)',
              border: '1px solid rgba(217,184,168,0.50)',
              fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#17110A',
            }}
          />
        </div>
      </div>

      {savedSpots.length > 0 && (
        <div className="relative px-5 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark size={15} color="#6B2200" strokeWidth={2} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#17110A' }}>
              Saved Spots
            </h3>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {savedSpots.map(spot => (
              <div key={spot.id} className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.88)', boxShadow: '0 4px 20px rgba(23,17,10,0.07)' }}>
                <Bookmark size={14} color="#6B2200" strokeWidth={1.75} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: '#17110A' }}>{spot.name}</p>
                </div>
                <RarityBadge score={spot.rarity} size="sm" />
                <button onClick={() => { removeSavedSpot(spot.id); setSavedSpots(getSavedSpots()) }}
                  style={{ color: '#D9B8A8', flexShrink: 0 }}>
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative px-5 py-4 pb-8 grid grid-cols-2 gap-3">
        {filteredTeams.map((team, i) => (
          <motion.button
            key={team.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.025 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => generateItinerary(team)}
            className="flex flex-col items-center gap-3 py-5 px-3 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.90)',
              border: '1px solid rgba(217,184,168,0.35)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(23,17,10,0.07)',
              touchAction: 'pan-y',
            }}
          >
            <img
              src={flagUrl(team.code)}
              alt={team.name}
              width={44} height={29}
              className="rounded object-cover"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.16)' }}
            />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: '#17110A', textAlign: 'center', lineHeight: '17px' }}>
              {team.name}
            </span>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600,
              background: '#FEF3EE', color: '#6B2200',
              border: '1px solid rgba(107,34,0,0.18)',
              padding: '2px 9px', borderRadius: 9999, letterSpacing: '0.04em',
            }}>
              {CITY_LABELS[team.city]}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" style={{ background: '#FAF7F2' }} />}>
      <ItineraryContent />
    </Suspense>
  )
}
