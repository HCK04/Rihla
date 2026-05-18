'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, MessageCircle, Camera, Map } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { t } from '@/lib/i18n'

export function BottomNav() {
  const pathname = usePathname()
  const { lang } = useLang()

  const NAV_ITEMS = [
    { href: '/discover',  icon: Compass,        label: t(lang, 'discover') },
    { href: '/chat',      icon: MessageCircle,  label: t(lang, 'chat')     },
    { href: '/scan',      icon: Camera,         label: t(lang, 'scan')     },
    { href: '/itinerary', icon: Map,            label: t(lang, 'plan')     },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: 'rgba(250,247,242,0.94)',
        backdropFilter: 'blur(28px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
        borderTop: '0.5px solid rgba(209,178,162,0.22)',
        boxShadow: '0 -8px 40px rgba(23,17,10,0.06)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 transition-all duration-200"
              style={{
                minWidth: 64,
                padding: '7px 16px 6px',
                borderRadius: 18,
                background: active ? 'rgba(107,34,0,0.10)' : 'transparent',
              }}
            >
              <Icon
                size={21}
                strokeWidth={active ? 2 : 1.5}
                style={{ color: active ? '#6B2200' : '#A09488' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#6B2200' : '#A09488',
                  letterSpacing: '0.04em',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
