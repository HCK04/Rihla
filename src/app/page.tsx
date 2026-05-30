'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, Globe2, Search } from 'lucide-react'
import { LanguageProvider, useLang, type Lang } from '@/lib/language-context'
import { t } from '@/lib/i18n'
import { flagUrl } from '@/content/flag-codes'
import teams from '@/content/teams/wc2030.json'

const CITY_LABELS: Record<string, string> = {
  casablanca: 'Casablanca',
  marrakech: 'Marrakech',
  rabat: 'Rabat',
  tangier: 'Tangier',
  agadir: 'Agadir',
  fez: 'Fez',
}

const LANGUAGES: { id: string; code: Lang; native: string; english: string }[] = [
  { id: 'en', code: 'en', native: 'English', english: 'English' },
  { id: 'fr', code: 'fr', native: 'Français', english: 'French' },
  { id: 'es', code: 'es', native: 'Español', english: 'Spanish' },
  { id: 'ar', code: 'ar', native: 'العربية', english: 'Arabic' },
  { id: 'darija', code: 'ar', native: 'الدارجة', english: 'Darija' },
  { id: 'de', code: 'de', native: 'Deutsch', english: 'German' },
]

type Stage = 'splash' | 'lang' | 'team'

function OnboardingInner() {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [stage, setStage] = useState<Stage>('splash')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [search, setSearch] = useState('')

  const filtered = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
  const selected = LANGUAGES.find(l => l.id === selectedLanguage) ?? LANGUAGES[0]

  const continueWithLanguage = () => {
    setLang(selected.code)
    setStage('team')
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-[#0F0E0C] text-[#F5EFE6]">
      <AnimatePresence mode="wait">
        {stage === 'splash' && (
          <motion.section
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="relative flex min-h-dvh flex-col justify-end px-5 pb-8 pt-safe-12"
          >
            <div
              className="ken-burns absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1548018560-c7196548e84d?auto=format&fit=crop&w=1200&q=85')",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,14,12,0.18)_0%,rgba(15,14,12,0.28)_38%,rgba(15,14,12,0.94)_100%)]" />
            <div className="rihla-zellige absolute inset-x-0 bottom-0 h-72 opacity-[0.08]" />

            <div className="relative z-10">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="mb-2 text-center text-7xl font-semibold text-[#F5EFE6]/75"
                style={{ fontFamily: '"Noto Naskh Arabic", serif', textShadow: '0 10px 36px rgba(0,0,0,0.55)' }}
              >
                رحلة
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.20 }}
                className="text-center text-[52px] font-semibold leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Rihla
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="mx-auto mt-3 max-w-xs text-center text-[16px] leading-6 text-[#D9CCB7]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Your local friend, always in your pocket.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44 }}
                className="mt-9"
              >
                <button
                  onClick={() => setStage('lang')}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#C4622D] text-[16px] font-semibold text-white shadow-[0_12px_36px_rgba(196,98,45,0.38)] active:scale-[0.98]"
                >
                  {t(lang, 'begin_journey')}
                  <ChevronRight size={18} strokeWidth={1.7} />
                </button>
                <p className="mt-3 text-center text-[13px] text-[#B9AD9B]">
                  {t(lang, 'no_account')}
                </p>
              </motion.div>
            </div>
          </motion.section>
        )}

        {stage === 'lang' && (
          <motion.section
            key="lang"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex min-h-dvh flex-col px-5 pb-8 pt-safe-12"
          >
            <div className="rihla-zellige pointer-events-none absolute right-[-3rem] top-10 h-56 w-56 opacity-[0.05]" />
            <button
              onClick={() => setStage('splash')}
              className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-[#E8A838]/20 bg-[#1A1815]/80"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1">
              <div className="mb-8 flex items-center gap-2 text-[#E8A838]">
                <Globe2 size={15} strokeWidth={1.6} />
                <span className="text-[11px] font-bold uppercase tracking-[0.08em]">Language</span>
              </div>
              <h2 className="max-w-sm text-[38px] font-semibold leading-[42px]" style={{ fontFamily: 'var(--font-display)' }}>
                {t(selected.code, 'language_question')}
              </h2>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {LANGUAGES.map((language, index) => {
                  const active = selectedLanguage === language.id
                  return (
                    <motion.button
                      key={language.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => setSelectedLanguage(language.id)}
                      className="min-h-[82px] rounded-2xl border p-4 text-left transition-transform active:scale-[0.98]"
                      style={{
                        background: active ? '#C4622D' : '#1A1815',
                        borderColor: active ? 'rgba(232,168,56,0.55)' : 'rgba(232,168,56,0.18)',
                        boxShadow: active ? '0 12px 32px rgba(196,98,45,0.28)' : 'none',
                        transform: active ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      <span className="block text-[17px] font-semibold text-white">{language.native}</span>
                      <span className="mt-1 block text-[12px] text-white/65">{language.english}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={continueWithLanguage}
              className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#C4622D] text-[16px] font-semibold text-white shadow-[0_12px_36px_rgba(196,98,45,0.32)] active:scale-[0.98]"
            >
              {t(selected.code, 'continue')}
              <ChevronRight size={18} strokeWidth={1.7} />
            </button>
          </motion.section>
        )}

        {stage === 'team' && (
          <motion.section
            key="team"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex min-h-dvh flex-col px-5 pb-8 pt-safe-12"
          >
            <div className="rihla-zellige pointer-events-none absolute inset-0 opacity-[0.035]" />
            <button
              onClick={() => setStage('lang')}
              className="relative mb-7 flex items-center gap-2 text-[14px] font-medium text-[#B9AD9B]"
            >
                <ArrowLeft size={16} strokeWidth={1.7} /> {t(selected.code, 'back')}
            </button>

            <div className="relative">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#E8A838]">{t(selected.code, 'world_cup_mode')}</p>
              <h2 className="text-[36px] font-semibold leading-[40px]" style={{ fontFamily: 'var(--font-display)' }}>
                {t(selected.code, 'team_following')}
              </h2>
              <p className="mt-3 text-[15px] leading-6 text-[#B9AD9B]">
                {t(selected.code, 'team_helper')}
              </p>

              <div className="relative mt-5">
                <Search size={15} color="#B9AD9B" strokeWidth={1.7} className="absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder={t(selected.code, 'search_team')}
                  className="h-12 w-full rounded-2xl border border-[#E8A838]/20 bg-[#1A1815] pl-10 pr-4 text-[15px] text-[#F5EFE6] outline-none placeholder:text-[#7A7060]"
                />
              </div>
            </div>

            <div className="relative mt-5 grid flex-1 grid-cols-2 gap-3 overflow-y-auto pb-4">
              {filtered.map((team, index) => (
                <motion.button
                  key={team.code}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.015 }}
                  onClick={() => router.push(`/itinerary?team=${team.code}`)}
                  className="rihla-card flex flex-col items-center gap-3 rounded-2xl px-3 py-5 text-center active:scale-[0.97]"
                >
                  <img
                    src={flagUrl(team.code)}
                    alt={team.name}
                    width={48}
                    height={32}
                    className="rounded object-cover shadow-[0_6px_18px_rgba(0,0,0,0.28)]"
                  />
                  <span className="text-[13px] font-semibold leading-[17px] text-[#F5EFE6]">{team.name}</span>
                  <span className="rounded-full border border-[#E8A838]/25 bg-[#E8A838]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#E8A838]">
                    {CITY_LABELS[team.city]}
                  </span>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => router.push('/discover')}
              className="relative h-12 rounded-lg border border-[#E8A838]/20 bg-[#1A1815] text-[14px] font-semibold text-[#D9CCB7]"
            >
              {t(selected.code, 'skip_explore_clean')}
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

export default function OnboardingPage() {
  return (
    <LanguageProvider>
      <OnboardingInner />
    </LanguageProvider>
  )
}
