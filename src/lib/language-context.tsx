'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'en' | 'fr' | 'ar' | 'es' | 'pt' | 'de'
const LANGS: Lang[] = ['en', 'fr', 'ar', 'es', 'pt', 'de']

function normalizeLang(value: string | null | undefined): Lang | null {
  if (!value) return null
  const code = value.split('-')[0].toLowerCase()
  return LANGS.includes(code as Lang) ? (code as Lang) : null
}

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  dir: 'ltr',
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = normalizeLang(localStorage.getItem('rihlai-lang'))
    const browser = normalizeLang(navigator.language)
    setLangState(stored ?? browser ?? 'en')
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('rihlai-lang', l)
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}

// Helper: pick localised string from a Spot name/description object
export function pick(obj: Record<string, string> | undefined, lang: Lang): string {
  if (!obj) return ''
  return obj[lang] ?? obj.en ?? ''
}
