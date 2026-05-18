export type City = 'casablanca' | 'marrakech' | 'rabat' | 'tangier' | 'agadir' | 'fez'

export type SpotCategory =
  | 'culture'
  | 'food'
  | 'nature'
  | 'medina'
  | 'market'
  | 'hammam'
  | 'cafe'
  | 'museum'
  | 'mosque'
  | 'viewpoint'

export interface SpotName {
  en: string
  fr: string
  ar: string
  es?: string
  pt?: string
  [key: string]: string | undefined
}

export interface Spot {
  id: string
  city: City
  name: SpotName
  category: SpotCategory
  rarity: number
  reviewCount: number
  photoCount: number
  distanceFromCenter: number
  description: SpotName
  culturalStory: Partial<SpotName>
  bestTime: string
  image: string
  coordinates: [number, number]
  tags: string[]
}

export type Team = {
  code: string
  name: string
  flag: string
  city: City
  group: string
}

export type Lang = 'en' | 'fr' | 'ar' | 'es' | 'pt' | 'de'

export type ItinerarySlot = {
  time: 'morning' | 'afternoon' | 'evening'
  spotId: string
  reason: string
}

export type ItineraryDay = {
  day: number
  label: string
  slots: ItinerarySlot[]
}
