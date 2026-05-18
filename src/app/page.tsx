'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronRight, ArrowLeft } from 'lucide-react'
import { LanguageProvider, useLang, type Lang } from '@/lib/language-context'
import { flagUrl } from '@/data/flag-codes'
import teams from '@/data/teams/wc2030.json'

const CITY_LABELS: Record<string, string> = {
  casablanca: 'Casablanca', marrakech: 'Marrakech',
  rabat: 'Rabat', tangier: 'Tangier', agadir: 'Agadir', fez: 'Fez',
}

const LANGUAGES: { code: Lang; native: string; english: string }[] = [
  { code: 'en', native: 'English',   english: 'English'    },
  { code: 'fr', native: 'Français',  english: 'French'     },
  { code: 'ar', native: 'العربية',   english: 'Arabic'     },
  { code: 'es', native: 'Español',   english: 'Spanish'    },
  { code: 'pt', native: 'Português', english: 'Portuguese' },
]

type Stage = 'video' | 'lang' | 'team'

function OnboardingInner() {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stage, setStage] = useState<Stage>('video')
  const [search, setSearch] = useState('')
  const [videoReady, setVideoReady] = useState(false)

  const filtered = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  const exitVideo = () => {
    const v = videoRef.current
    if (v) { v.pause(); v.src = '' }
    setStage('lang')
  }

  useEffect(() => {
    videoRef.current?.play().catch(() => exitVideo())
    // Fallback: if video hasn't started within 2s, skip straight to lang
    const timer = setTimeout(() => {
      setStage(s => s === 'video' ? 'lang' : s)
    }, 2000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTeamSelect = (code: string) => {
    router.push(`/itinerary?team=${code}`)
  }

  return (
    <div className="min-h-dvh flex flex-col overflow-hidden" style={{ background: '#FAF7F2' }}>
      <AnimatePresence mode="wait">

        {/* ─── VIDEO SPLASH ─── */}
        {stage === 'video' && (
          <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col" style={{ background: '#17110A' }}>
            <video
              ref={videoRef}
              src="/video/onboarding.mp4"
              className="absolute inset-0 w-full h-full object-cover"
              muted playsInline autoPlay preload="auto"
              onCanPlay={() => setVideoReady(true)}
              onEnded={exitVideo}
              onError={exitVideo}
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, transparent 28%, transparent 44%, rgba(12,7,3,0.78) 78%, rgba(12,7,3,0.97) 100%)',
            }} />

            {/* Skip */}
            <div className="relative z-10 flex justify-end px-5 pt-safe-14">
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}
                onClick={exitVideo}
                style={{
                  fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
                  color: 'rgba(255,255,255,0.68)', letterSpacing: '0.03em',
                  background: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(8px)',
                  border: '0.5px solid rgba(255,255,255,0.14)',
                  padding: '8px 16px', borderRadius: 9999,
                }}
              >
                Skip
              </motion.button>
            </div>

            {/* Branding + CTA */}
            <div className="relative z-10 mt-auto px-6 pb-12 safe-bottom">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <img src="/logo.png" alt="RihlAI" style={{ height: 72, width: 'auto', objectFit: 'contain', marginBottom: 10, filter: 'brightness(0) invert(1)' }} />
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 300, color: 'rgba(255,255,255,0.68)', letterSpacing: '0.05em', marginBottom: 32 }}>
                  Morocco, as locals know it.
                </p>
                <button
                  onClick={exitVideo}
                  className="w-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  style={{
                    height: 58, borderRadius: 18,
                    background: '#6B2200', boxShadow: '0 8px 36px rgba(107,34,0,0.55)',
                    fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600,
                    color: '#FFFFFF', letterSpacing: '0.02em',
                  }}
                >
                  Begin your journey
                  <ChevronRight size={18} strokeWidth={2} />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ─── LANGUAGE PICKER ─── */}
        {stage === 'lang' && (
          <motion.div key="lang" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 flex flex-col min-h-dvh" style={{ background: '#FAF7F2' }}>
            <div className="fixed inset-0 zellige-bg pointer-events-none opacity-40" />
            <div className="relative flex-1 flex flex-col px-5 safe-top">
              <div className="flex-1 flex flex-col justify-center py-10">

                {/* Wordmark */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
                  <img src="/logo.png" alt="RihlAI" style={{ height: 56, width: 'auto', objectFit: 'contain', marginBottom: 6 }} />
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400, color: '#8C6E60', marginTop: 6, letterSpacing: '0.03em' }}>
                    Morocco, as locals know it.
                  </p>
                </motion.div>

                {/* Language list */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={12} color="#6B2200" strokeWidth={2} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.10em', color: '#6B2200', textTransform: 'uppercase' }}>
                      Choose your language
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {LANGUAGES.map((l, i) => (
                      <motion.button key={l.code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 + i * 0.06 }}
                        onClick={() => setLang(l.code)}
                        className="flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-200"
                        style={{
                          background: lang === l.code ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                          border: `1px solid ${lang === l.code ? '#9B3B0A' : 'rgba(217,184,168,0.55)'}`,
                          boxShadow: lang === l.code ? '0 4px 24px rgba(107,34,0,0.13)' : 'none',
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: lang === l.code ? 700 : 400, color: lang === l.code ? '#6B2200' : '#17110A', flex: 1 }}>
                          {l.native}
                        </span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#8C6E60' }}>
                          {l.english}
                        </span>
                        {lang === l.code && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#6B2200' }}>
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}
                className="pb-8 safe-bottom flex flex-col gap-3">
                <button onClick={() => setStage('team')}
                  className="w-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  style={{
                    background: '#6B2200', color: '#FFFFFF', height: 58, borderRadius: 18,
                    fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600,
                    letterSpacing: '0.02em', boxShadow: '0 8px 28px rgba(107,34,0,0.32)',
                  }}>
                  Continue <ChevronRight size={18} strokeWidth={2} />
                </button>
                <button onClick={() => router.push('/discover')}
                  style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400, color: '#8C6E60', height: 44 }}>
                  Skip — just explore
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ─── TEAM PICKER ─── */}
        {stage === 'team' && (
          <motion.div key="team" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.40, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex-1 flex flex-col min-h-dvh" style={{ background: '#FAF7F2' }}>
            <div className="fixed inset-0 zellige-bg pointer-events-none opacity-40" />
            <div className="relative px-5 pt-safe-14 pb-4">
              <button onClick={() => setStage('lang')} className="flex items-center gap-1.5 mb-6"
                style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: '#8C6E60' }}>
                <ArrowLeft size={16} strokeWidth={1.75} /> Back
              </button>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, lineHeight: '38px', letterSpacing: '-0.01em', color: '#17110A', marginBottom: 8 }}>
                Which team are you following?
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400, color: '#8C6E60', marginBottom: 16 }}>
                We'll craft your city itinerary around match day.
              </p>
              <input type="text" placeholder="Search team…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full px-4 outline-none"
                style={{
                  height: 50, borderRadius: 14,
                  background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(217,184,168,0.55)',
                  fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#17110A',
                }} />
            </div>

            <div className="relative flex-1 overflow-y-auto px-5 pb-8">
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((team, i) => (
                  <motion.button key={team.code}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleTeamSelect(team.code)}
                    className="flex flex-col items-center gap-3 py-5 px-3 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.85)',
                      border: '1px solid rgba(217,184,168,0.38)',
                      boxShadow: '0 4px 20px rgba(23,17,10,0.07)',
                      touchAction: 'pan-y',
                    }}>
                    <img src={flagUrl(team.code)} alt={team.name} width={44} height={29}
                      className="rounded object-cover" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.16)' }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: '#17110A', textAlign: 'center', lineHeight: '17px' }}>
                      {team.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600,
                      background: '#FEF3EE', color: '#6B2200',
                      border: '1px solid rgba(107,34,0,0.18)', padding: '2px 9px', borderRadius: 9999,
                    }}>
                      {CITY_LABELS[team.city]}
                    </span>
                  </motion.button>
                ))}
              </div>
              <button onClick={() => router.push('/discover')} className="w-full mt-4" style={{
                height: 50, borderRadius: 16,
                background: 'rgba(234,230,223,0.80)',
                fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: '#8C6E60',
              }}>
                Skip — I'm just exploring
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <LanguageProvider>
      <OnboardingInner />
    </LanguageProvider>
  )
}
