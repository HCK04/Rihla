'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RihlaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: ReactNode
}

export function RihlaButton({
  variant = 'primary',
  icon,
  className,
  children,
  ...props
}: RihlaButtonProps) {
  const variants = {
    primary: 'bg-[#C4622D] text-white shadow-[0_12px_36px_rgba(196,98,45,0.30)] border-[#E8A838]/25',
    secondary: 'bg-[#1A1815] text-[#F0E8D8] border-[#E8A838]/22',
    ghost: 'bg-transparent text-[#D9CCB7] border-transparent',
  }

  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-[14px] font-semibold transition active:scale-[0.98] disabled:opacity-40',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
