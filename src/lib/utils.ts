import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRarityLabel(score: number): { label: string; color: string } {
  if (score >= 86) return { label: 'Hidden Gem', color: '#1ABC9C' }
  if (score >= 61) return { label: "Local Favourite", color: '#27AE60' }
  if (score >= 31) return { label: 'Known Spot', color: '#F39C12' }
  return { label: 'Tourist Trap', color: '#E74C3C' }
}

export function getRarityDescription(score: number): string {
  if (score >= 86) return `Only ${Math.round((100 - score) * 0.5)}% of tourists find this`
  if (score >= 61) return `${Math.round(score * 0.3)}% of visitors are locals`
  if (score >= 31) return 'Popular with travellers in the know'
  return 'Heavily visited by tourists'
}

export function formatRarityScore(score: number): string {
  return score.toString().padStart(2, '0')
}
