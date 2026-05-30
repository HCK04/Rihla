'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Globe2,
  Heart,
  Languages,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserRound,
} from 'lucide-react'
import { getSavedSpots } from '@/lib/saved-spots'
import { useLang, type Lang } from '@/lib/language-context'
import { t } from '@/lib/i18n'

const LANGUAGES: { id: string; code: Lang; native: string; english: string }[] = [
  { id: 'en', code: 'en', native: 'English', english: 'English' },
  { id: 'fr', code: 'fr', native: 'Francais', english: 'French' },
  { id: 'es', code: 'es', native: 'Espanol', english: 'Spanish' },
  { id: 'ar', code: 'ar', native: 'Arabic', english: 'Arabic' },
  { id: 'darija', code: 'ar', native: 'Darija', english: 'Moroccan Arabic' },
  { id: 'de', code: 'de', native: 'Deutsch', english: 'German' },
]

const PREFERENCES = ['Food-first', 'Hidden gems', 'Walkable routes', 'Match ready']

export default function ProfilePage() {
  const { lang, setLang } = useLang()
  const [savedCount, setSavedCount] = useState(0)
  const [hasItinerary, setHasItinerary] = useState(false)
  const activeLanguage = LANGUAGES.find(language => language.code === lang) ?? LANGUAGES[0]

  useEffect(() => {
    setSavedCount(getSavedSpots().length)
    setHasItinerary(Boolean(localStorage.getItem('rihlai_saved_itinerary')))
  }, [])

  return (
    <main className="rihla-screen min-h-dvh pb-8">
      <div className="rihla-zellige pointer-events-none fixed inset-0 opacity-[0.035]" />

      <header className="relative px-5 pb-6 pt-safe-12">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[28px] border border-[#E8A838]/26 bg-[#1A1815] shadow-[0_14px_42px_rgba(0,0,0,0.28)]">
              <UserRound size={32} color="#F5EFE6" strokeWidth={1.45} />
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl border border-[#0F0E0C] bg-[#C4622D]">
                <Sparkles size={14} color="#FFFFFF" strokeWidth={1.8} />
              </span>
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">Rihla traveler</p>
              <h1 className="truncate text-[34px] font-semibold leading-[38px] text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>
                Saad
              </h1>
              <p className="mt-1 text-[14px] leading-5 text-[#B8A898]">Morocco 2030 companion</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] text-[#E8A838]"
          >
            <Bell size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { label: 'Saved', value: savedCount, icon: Heart },
            { label: 'Plan', value: hasItinerary ? 1 : 0, icon: CalendarDays },
            { label: 'Cities', value: 6, icon: MapPinned },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-[#E8A838]/16 bg-[#1A1815] px-3 py-4 text-center shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
              <item.icon className="mx-auto mb-2 text-[#E8A838]" size={17} strokeWidth={1.8} />
              <p className="text-[21px] font-semibold leading-6 text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>{item.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8E8170]">{item.label}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="relative px-5">
        <Link
          href="/itinerary"
          className="flex min-h-[98px] items-center gap-4 rounded-2xl border border-[#E8A838]/22 bg-[#1A1815] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.24)] active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#E8A838]/12 text-[#E8A838]">
            <Trophy size={22} strokeWidth={1.7} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.10em] text-[#E8A838]">Next best action</p>
            <h2 className="mt-1 text-[20px] font-semibold leading-6 text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>
              {hasItinerary ? 'Continue your match plan' : t(lang, 'match_day_planner')}
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[#B8A898]">{t(lang, 'match_planner_body')}</p>
          </div>
          <ChevronRight size={18} color="#E8A838" strokeWidth={1.8} />
        </Link>
      </section>

      <section className="relative mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[21px] font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>Travel style</h2>
          <span className="rounded-full border border-[#E8A838]/18 bg-[#E8A838]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#E8A838]">
            Local mode
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PREFERENCES.map((preference, index) => (
            <button
              key={preference}
              type="button"
              className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-[#E8A838]/16 bg-[#1A1815] px-4 text-left active:scale-[0.98]"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#0F0E0C] text-[#E8A838]">
                {index === 0 ? <Star size={16} strokeWidth={1.8} /> : <Check size={16} strokeWidth={1.9} />}
              </span>
              <span className="text-[13px] font-semibold leading-4 text-[#F0E8D8]">{preference}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="relative mt-6 px-5">
        <h2 className="mb-3 text-[21px] font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>
          {t(lang, 'language_settings')}
        </h2>
        <div className="rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.20)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#C4622D]/16 text-[#C4622D]">
              <Languages size={19} strokeWidth={1.7} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#E8A838]">
                <Globe2 size={13} strokeWidth={1.7} />
                <span className="text-[10px] font-bold uppercase tracking-[0.10em]">{t(lang, 'current_language')}</span>
              </div>
              <p className="mt-1 text-[16px] font-semibold text-[#F0E8D8]">{activeLanguage.native}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map(language => {
              const active = language.code === lang
              return (
                <button
                  key={language.id}
                  onClick={() => setLang(language.code)}
                  className="min-h-[66px] rounded-2xl border p-3 text-left transition active:scale-[0.98]"
                  style={{
                    background: active ? '#C4622D' : '#0F0E0C',
                    borderColor: active ? 'rgba(232,168,56,0.48)' : 'rgba(232,168,56,0.16)',
                    color: active ? '#FFFFFF' : '#F0E8D8',
                    boxShadow: active ? '0 12px 32px rgba(196,98,45,0.24)' : 'none',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold">{language.native}</span>
                      <span className="mt-1 block truncate text-[11px] opacity-70">{language.english}</span>
                    </span>
                    {active && <Check size={16} strokeWidth={2.2} />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative mt-6 px-5">
        <h2 className="mb-3 text-[21px] font-semibold text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>Account</h2>
        <div className="overflow-hidden rounded-2xl border border-[#E8A838]/18 bg-[#1A1815] shadow-[0_8px_30px_rgba(0,0,0,0.20)]">
          {[
            { icon: ShieldCheck, label: 'Privacy and safety', value: 'Local-first profile' },
            { icon: Sparkles, label: 'Rihla memory', value: 'Food, gems, stadium routes' },
            { icon: CalendarDays, label: 'Match schedule', value: hasItinerary ? 'Planner saved' : 'Choose a team' },
          ].map((row, index, rows) => (
            <button
              key={row.label}
              type="button"
              className="flex min-h-[68px] w-full items-center gap-3 px-4 text-left active:bg-[#211E19]"
              style={{ borderBottom: index === rows.length - 1 ? 'none' : '1px solid rgba(232,168,56,0.12)' }}
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0F0E0C] text-[#E8A838]">
                <row.icon size={17} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-[#F0E8D8]">{row.label}</span>
                <span className="mt-0.5 block truncate text-[12px] text-[#8E8170]">{row.value}</span>
              </span>
              <ChevronRight size={16} color="#786858" strokeWidth={1.8} />
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
