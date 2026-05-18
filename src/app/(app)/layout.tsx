import { BottomNav } from '@/components/shared/BottomNav'
import { LanguageProvider } from '@/lib/language-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-dvh pb-safe-20" style={{ background: '#FAF7F2' }}>
        {children}
        <BottomNav />
      </div>
    </LanguageProvider>
  )
}
