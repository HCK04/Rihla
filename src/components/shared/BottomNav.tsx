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
        background: 'rgba(250,248,244,0.88)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        borderTop: '0.5px solid rgba(221,188,172,0.30)',
        boxShadow: '0 -1px 0 rgba(221,188,172,0.20), 0 -8px 32px rgba(28,20,14,0.06)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2.5 pb-3">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-5 py-1 relative"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2 : 1.6}
                style={{ color: active ? '#8c3500' : '#6b7c8c' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#8c3500' : '#6b7c8c',
                  letterSpacing: '0.04em',
                }}
              >
                {label}
              </span>
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 18,
                    height: 2,
                    borderRadius: 2,
                    background: '#8c3500',
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
