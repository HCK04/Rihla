'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Camera, Home, MapPinned, MessageCircle, Sparkles, UserRound, X } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { t } from '@/lib/i18n'

export function BottomNav() {
  const pathname = usePathname()
  const { lang } = useLang()
  const [actionsOpen, setActionsOpen] = useState(false)

  const NAV_ITEMS = [
    { href: '/discover', icon: Home, label: t(lang, 'nav_home') },
    { href: '/map', icon: MapPinned, label: t(lang, 'nav_map') },
    { href: '/chat', icon: Sparkles, label: t(lang, 'ask_rihla'), center: true },
    { href: '/scan', icon: Camera, label: t(lang, 'scan') },
    { href: '/profile', icon: UserRound, label: t(lang, 'nav_profile') },
  ]

  return (
    <>
      <AnimatePresence>
        {actionsOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close Rihla actions"
              className="fixed inset-0 z-40 bg-black/38"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActionsOpen(false)}
            />
            <motion.div
              className="fixed bottom-[94px] left-1/2 z-50 w-[min(92vw,390px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#E8A838]/22 bg-[#14120F] shadow-[0_22px_70px_rgba(0,0,0,0.46)]"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-center justify-between border-b border-[#E8A838]/14 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#E8A838]">Rihla</p>
                  <p className="text-[14px] font-semibold text-[#F5EFE6]">Choose how to continue</p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setActionsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8A838]/14 bg-[#0F0E0C] text-[#B9AD9B]"
                >
                  <X size={16} strokeWidth={1.8} />
                </button>
              </div>

              <div className="grid gap-2 p-3">
                <Link
                  href="/chat"
                  onClick={() => setActionsOpen(false)}
                  className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-[#E8A838]/16 bg-[#1A1815] px-4 py-3 active:scale-[0.99]"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#C4622D] text-white">
                    <MessageCircle size={19} strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-[#F5EFE6]">{t(lang, 'ask_rihla')}</span>
                    <span className="mt-0.5 block text-[12px] leading-5 text-[#B9AD9B]">Ask anything about Morocco, food, routes, and hidden gems.</span>
                  </span>
                </Link>

                <Link
                  href="/itinerary"
                  onClick={() => setActionsOpen(false)}
                  className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-[#E8A838]/16 bg-[#1A1815] px-4 py-3 active:scale-[0.99]"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#E8A838]/12 text-[#E8A838]">
                    <CalendarDays size={19} strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-[#F5EFE6]">{t(lang, 'match_day_planner')}</span>
                    <span className="mt-0.5 block text-[12px] leading-5 text-[#B9AD9B]">Plan around your match, host city, position, and schedule.</span>
                  </span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
        style={{
          background: 'rgba(15,14,12,0.88)',
          backdropFilter: 'blur(28px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          borderTop: '0.5px solid rgba(232,168,56,0.20)',
          boxShadow: '0 -12px 44px rgba(0,0,0,0.36)',
        }}
      >
        <div className="flex items-end justify-around px-2 pt-2 pb-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label, center }) => {
            const active = center ? pathname.startsWith('/chat') || pathname.startsWith('/itinerary') : pathname.startsWith(href)
            const content = (
              <>
                <span
                  className="flex items-center justify-center transition-transform duration-200"
                  style={{
                    width: center ? 54 : 28,
                    height: center ? 54 : 28,
                    borderRadius: center ? 9999 : 12,
                    marginTop: center ? -22 : 0,
                    background: center
                      ? 'linear-gradient(135deg, #C4622D 0%, #E8A838 120%)'
                      : active ? 'rgba(196,98,45,0.18)' : 'transparent',
                    border: center ? '1px solid rgba(232,168,56,0.38)' : '1px solid transparent',
                    boxShadow: center ? '0 12px 34px rgba(196,98,45,0.38)' : 'none',
                    transform: active && center ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                <Icon
                  size={center ? 23 : 20}
                  strokeWidth={1.6}
                  style={{ color: center || active ? '#FFFFFF' : '#9D927F' }}
                />
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '10px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#E8A838' : '#9D927F',
                    letterSpacing: '0.02em',
                  }}
                >
                  {label}
                </span>
              </>
            )

            if (center) {
              return (
                <button
                  key={href}
                  type="button"
                  aria-label={label}
                  aria-expanded={actionsOpen}
                  onClick={() => setActionsOpen(open => !open)}
                  className="flex flex-col items-center gap-1 transition-all duration-200"
                  style={{
                    minWidth: 72,
                    padding: '0 10px 4px',
                    borderRadius: 16,
                  }}
                >
                  {content}
                </button>
              )
            }

            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                onClick={() => setActionsOpen(false)}
                className="flex flex-col items-center gap-1 transition-all duration-200"
                style={{
                  minWidth: 58,
                  padding: '7px 8px 6px',
                  borderRadius: 16,
                }}
              >
                {content}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
