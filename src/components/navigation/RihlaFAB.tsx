'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useLang } from '@/lib/language-context'
import { t } from '@/lib/i18n'

export function RihlaFAB() {
  const { lang } = useLang()
  return (
    <Link
      href="/chat"
      aria-label={t(lang, 'ask_rihla')}
      className="fixed bottom-[calc(92px+env(safe-area-inset-bottom,0px))] right-5 z-[260] flex h-14 w-14 items-center justify-center rounded-full border border-[#E8A838]/35 bg-[#C4622D] text-white shadow-[0_14px_38px_rgba(196,98,45,0.38)] active:scale-95"
    >
      <Sparkles size={23} strokeWidth={1.7} />
    </Link>
  )
}
