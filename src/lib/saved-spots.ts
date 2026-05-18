export interface SavedSpot {
  id: string
  name: string
  city: string
  category: string
  rarity: number
  bestTime: string
  description: string
  source: 'spot' | 'scan'
}

const KEY = 'rihlai_saved_spots'

export function getSavedSpots(): SavedSpot[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function isSpotSaved(id: string): boolean {
  return getSavedSpots().some(s => s.id === id)
}

export function toggleSavedSpot(spot: SavedSpot): boolean {
  const current = getSavedSpots()
  const idx = current.findIndex(s => s.id === spot.id)
  if (idx >= 0) {
    current.splice(idx, 1)
    localStorage.setItem(KEY, JSON.stringify(current))
    return false
  }
  localStorage.setItem(KEY, JSON.stringify([...current, spot]))
  return true
}

export function removeSavedSpot(id: string) {
  const current = getSavedSpots().filter(s => s.id !== id)
  localStorage.setItem(KEY, JSON.stringify(current))
}
