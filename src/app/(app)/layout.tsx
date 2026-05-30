import { BottomNav } from '@/components/navigation/BottomNav'
import { LanguageProvider } from '@/lib/language-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="rihla-screen min-h-dvh pb-safe-20">
        {children}
        <BottomNav />
      </div>
    </LanguageProvider>
  )
}
