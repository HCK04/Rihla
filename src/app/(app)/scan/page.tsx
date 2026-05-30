'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, RotateCcw, Plus, Check, ImageIcon } from 'lucide-react'
import { RarityBadge } from '@/components/ui/RarityBadge'
import { useLang } from '@/lib/language-context'
import { t } from '@/lib/i18n'
import { toggleSavedSpot } from '@/lib/saved-spots'

interface ScanResult {
  name: string
  type: string
  description: string
  culturalStory: string
  rarity?: number
  bestTime?: string
}

export default function ScanPage() {
  const { lang } = useLang()
  const [result, setResult]     = useState<ScanResult | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [scanSaved, setScanSaved] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const openCamera = () => {
    if (fileRef.current) {
      fileRef.current.value = ''
      fileRef.current.click()
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setLoading(true)
    setError(null)
    setResult(null)
    setPreview(URL.createObjectURL(file))

    try {
      const base64 = await fileToBase64(file)
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: 'image/jpeg', lang }),
      })
      const data = await res.json()
      if (res.status === 422 && data.error === 'not_confident') {
        setError('Image not clear enough to identify. Try a closer photo with better lighting.')
        return
      }
      if (!res.ok) throw new Error(data.error ?? 'Scan failed')
      setResult(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      if (msg.includes('ollama') || msg.includes('llava') || msg.includes('ECONNREFUSED')) {
        setError('Vision model not available. Run: ollama pull llava — then make sure Ollama is running.')
      } else if (msg.includes('API key')) {
        setError('No AI configured. Add ANTHROPIC_API_KEY or start Ollama in .env.local.')
      } else {
        setError(t(lang, 'something_went_wrong'))
      }
    } finally {
      setLoading(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const MAX = 1024
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/jpeg', 0.82).split(',')[1])
      }
      img.onerror = reject
      img.src = url
    })

  const handleReset = () => { setResult(null); setError(null); setPreview(null); setScanSaved(false) }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#0F0E0C', color: '#F5EFE6' }}>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />

      {/* Header */}
      <div className="px-5 pb-4 pt-safe-12" style={{ borderBottom: '0.5px solid rgba(232,168,56,0.20)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: '#F5EFE6', letterSpacing: '-0.01em' }}>
          {t(lang, 'scan_heading')}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#B9AD9B', marginTop: 4 }}>
          {t(lang, 'scan_subheading')}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6">
        <AnimatePresence mode="wait">

          {/* ── IDLE ── */}
          {!result && !loading && !error && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 w-full">

              {/* Circular lens UI */}
              <button
                onClick={openCamera}
                className="relative flex items-center justify-center active:scale-[0.97] transition-transform duration-200"
                style={{ width: 260, height: 260 }}
              >
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full scan-ring"
                  style={{ border: '1.5px solid rgba(232,168,56,0.24)' }} />
                <div className="absolute inset-0 rounded-full scan-ring-delay"
                  style={{ border: '1.5px solid rgba(232,168,56,0.16)' }} />
                {/* Static outer ring */}
                <div className="absolute rounded-full"
                  style={{ inset: 16, border: '1px dashed rgba(232,168,56,0.22)', borderRadius: 9999 }} />
                {/* Inner button */}
                <div
                  className="flex flex-col items-center justify-center gap-3"
                  style={{
                    width: 188,
                    height: 188,
                    borderRadius: 9999,
                    background: '#1A1815',
                    boxShadow: '0 16px 56px rgba(0,0,0,0.32), 0 8px 32px rgba(196,98,45,0.15)',
                    border: '1px solid rgba(232,168,56,0.22)',
                  }}
                >
                  <Camera size={42} strokeWidth={1.3} color="#E8A838" />
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#D9CCB7',
                  }}>
                    {t(lang, 'scan_tap')}
                  </span>
                </div>
              </button>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={openCamera}
                  className="flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#B9AD9B' }}
                >
                  <ImageIcon size={13} strokeWidth={1.75} />
                  {t(lang, 'scan_gallery')}
                </button>
                <p className="text-center" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#7A7060', maxWidth: 260, lineHeight: '20px' }}>
                  {t(lang, 'scan_hint')}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── LOADING ── */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 w-full">

              {preview && (
                <div className="relative rounded-3xl overflow-hidden" style={{ width: 180, height: 180, boxShadow: '0 16px 48px rgba(23,17,10,0.18)' }}>
                  <img src={preview} alt="scan" className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(23,17,10,0.55) 100%)' }} />
                  <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                    <div className="flex gap-1.5">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{ background: 'rgba(255,255,255,0.85)', animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!preview && (
                <div className="w-18 h-18 rounded-3xl flex items-center justify-center"
                  style={{ background: '#FEF3EE', border: '1px solid rgba(155,59,10,0.18)', width: 80, height: 80 }}>
                  <Sparkles size={32} color="#6B2200" strokeWidth={1.5} className="animate-pulse" />
                </div>
              )}

              <div className="text-center">
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: '#17110A', marginBottom: 6 }}>
                  {t(lang, 'scan_identifying')}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#8C6E60', lineHeight: '22px', maxWidth: 260 }}>
                  Analysing every detail carefully
                </p>
              </div>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5 w-full">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#FFF0F0', border: '1px solid #FFDAD6' }}>
                <Camera size={26} color="#BA1A1A" strokeWidth={1.75} />
              </div>
              <p className="text-center" style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#BA1A1A', lineHeight: '22px', maxWidth: 300 }}>
                {error}
              </p>
              <button onClick={() => { handleReset(); openCamera() }}
                className="flex items-center gap-2"
                style={{
                  height: 52, paddingLeft: 24, paddingRight: 24, borderRadius: 16,
                  background: '#EAE6DF',
                  fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: '#6B5246',
                }}>
                <RotateCcw size={15} />{t(lang, 'try_again')}
              </button>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col gap-4">

              <div className="rounded-3xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 16px 48px rgba(23,17,10,0.12)' }}>

                {preview && (
                  <div className="relative h-52 w-full overflow-hidden">
                    <img src={preview} alt={result.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(12,7,3,0.82) 100%)' }} />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block mb-1.5 uppercase"
                        style={{
                          fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.10em',
                          color: '#FFFFFF', background: 'rgba(0,0,0,0.42)',
                          backdropFilter: 'blur(6px)', border: '0.5px solid rgba(255,255,255,0.20)',
                          padding: '3px 9px', borderRadius: 9999,
                        }}>
                        {result.type}
                      </span>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#FFFFFF', lineHeight: '28px', letterSpacing: '-0.01em' }}>
                        {result.name}
                      </h2>
                    </div>
                    {result.rarity && (
                      <div className="absolute top-3 right-3">
                        <RarityBadge score={result.rarity} size="sm" dark />
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5">
                  {!preview && (
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-3">
                        <span className="inline-block mb-2 uppercase"
                          style={{
                            fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.10em',
                            color: '#6B2200', background: '#FEF3EE', border: '1px solid rgba(107,34,0,0.20)',
                            padding: '3px 9px', borderRadius: 9999,
                          }}>
                          {result.type}
                        </span>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#17110A', letterSpacing: '-0.01em' }}>
                          {result.name}
                        </h2>
                      </div>
                      {result.rarity && <RarityBadge score={result.rarity} size="md" />}
                    </div>
                  )}

                  <p className="mb-4" style={{
                    fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: '24px', color: '#6B5246',
                    direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left',
                  }}>
                    {result.description}
                  </p>

                  {result.bestTime && (
                    <p className="mb-4" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#8C6E60' }}>
                      {t(lang, 'scan_best_time_label')} {result.bestTime}
                    </p>
                  )}

                  <div className="zellige-divider mb-4" />

                  <p className="mb-2 uppercase" style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.10em', color: '#6B2200' }}>
                    {t(lang, 'scan_cultural_story')}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: '22px', color: '#17110A',
                    direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left',
                  }}>
                    {result.culturalStory}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { handleReset(); openCamera() }}
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{
                    height: 54, borderRadius: 16, background: '#EAE6DF',
                    fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: '#6B5246',
                  }}>
                  <RotateCcw size={15} />{t(lang, 'scan_another')}
                </button>
                <button
                  onClick={() => {
                    if (!result || scanSaved) return
                    const id = `scan-${Date.now()}`
                    toggleSavedSpot({
                      id,
                      name: result.name,
                      city: '',
                      category: result.type?.toLowerCase() ?? 'culture',
                      rarity: result.rarity ?? 50,
                      bestTime: result.bestTime ?? '',
                      description: result.description,
                      source: 'scan',
                    })
                    setScanSaved(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{
                    height: 54, borderRadius: 16,
                    background: scanSaved ? '#2A5C3F' : '#6B2200',
                    boxShadow: scanSaved ? '0 6px 24px rgba(42,92,63,0.28)' : '0 6px 24px rgba(107,34,0,0.30)',
                    fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: '#FFFFFF',
                    transition: 'background 0.25s, box-shadow 0.25s',
                  }}>
                  {scanSaved ? <Check size={15} strokeWidth={2.5} /> : <Plus size={15} strokeWidth={2} />}
                  {scanSaved ? t(lang, 'saved') : t(lang, 'add_to_plan')}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
