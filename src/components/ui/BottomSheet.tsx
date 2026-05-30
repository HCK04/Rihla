'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  closeOnBackdrop?: boolean
  showHandle?: boolean
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  className,
  closeOnBackdrop = true,
  showHandle = true,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close sheet"
            className="fixed inset-0 z-[190] bg-black/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'fixed inset-x-0 bottom-0 z-[200] max-h-[82dvh] overflow-y-auto rounded-t-[24px] border-t border-[#E8A838]/22 bg-[#1A1815] px-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-3 shadow-[0_-18px_70px_rgba(0,0,0,0.58)]',
              className
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 650) onClose()
            }}
          >
            {showHandle && <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-[#786858]" />}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
