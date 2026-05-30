import { cn } from '@/lib/utils'

export function ZelligeDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-4 w-full bg-repeat-x opacity-70', className)}
      style={{ backgroundImage: "url('/patterns/zellige-divider.svg')" }}
      aria-hidden="true"
    />
  )
}
