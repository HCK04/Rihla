'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, Gem, LocateFixed, MapPin, Sparkles, Utensils } from 'lucide-react'
import { RihlaFAB } from '@/components/navigation/RihlaFAB'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { RarityBadge } from '@/components/ui/RarityBadge'
import { pick, useLang } from '@/lib/language-context'
import { t } from '@/lib/i18n'
import marrakechSpots from '@/content/spots/marrakech.json'
import fezSpots from '@/content/spots/fez.json'
import casablancaSpots from '@/content/spots/casablanca.json'
import rabatSpots from '@/content/spots/rabat.json'
import tangierSpots from '@/content/spots/tangier.json'
import agadirSpots from '@/content/spots/agadir.json'
import type { City, Spot, SpotCategory } from '@/lib/types'

const ALL_SPOTS = [
  ...marrakechSpots,
  ...fezSpots,
  ...casablancaSpots,
  ...rabatSpots,
  ...tangierSpots,
  ...agadirSpots,
] as Spot[]

const CITY_LABELS: Record<City, string> = {
  marrakech: 'Marrakech',
  fez: 'Fès',
  casablanca: 'Casablanca',
  rabat: 'Rabat',
  tangier: 'Tangier',
  agadir: 'Agadir',
}

const CITY_CENTERS: Record<City, { lat: number; lng: number; zoom: number }> = {
  marrakech: { lat: 31.6295, lng: -7.9811, zoom: 13 },
  fez: { lat: 34.0181, lng: -5.0078, zoom: 13 },
  casablanca: { lat: 33.5731, lng: -7.5898, zoom: 12 },
  rabat: { lat: 34.0209, lng: -6.8416, zoom: 13 },
  tangier: { lat: 35.7595, lng: -5.834, zoom: 13 },
  agadir: { lat: 30.4278, lng: -9.5981, zoom: 12 },
}

const CITY_IDS = Object.keys(CITY_LABELS) as City[]
const TILE_SIZE = 256
const MAP_WIDTH = 896
const MAP_HEIGHT = 960

type Filter = 'all' | 'food' | 'culture' | 'nature' | 'hidden'

const FILTERS: { id: Filter; labelKey: string; icon?: React.ReactNode }[] = [
  { id: 'all', labelKey: 'all' },
  { id: 'food', labelKey: 'food', icon: <Utensils size={13} strokeWidth={1.7} /> },
  { id: 'culture', labelKey: 'culture', icon: <MapPin size={13} strokeWidth={1.7} /> },
  { id: 'nature', labelKey: 'nature', icon: <LocateFixed size={13} strokeWidth={1.7} /> },
  { id: 'hidden', labelKey: 'hidden', icon: <Gem size={13} strokeWidth={1.7} /> },
]

const FOOD_CATEGORIES: SpotCategory[] = ['food', 'cafe']
const CULTURE_CATEGORIES: SpotCategory[] = ['culture', 'medina', 'market', 'museum', 'mosque', 'hammam']
const NATURE_CATEGORIES: SpotCategory[] = ['nature', 'viewpoint']

function matchesFilter(spot: Spot, filter: Filter) {
  if (filter === 'all') return true
  if (filter === 'hidden') return spot.rarity >= 75
  if (filter === 'food') return FOOD_CATEGORIES.includes(spot.category)
  if (filter === 'culture') return CULTURE_CATEGORIES.includes(spot.category)
  if (filter === 'nature') return NATURE_CATEGORIES.includes(spot.category)
  return true
}

function lngToTileX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * 2 ** zoom
}

function latToTileY(lat: number, zoom: number) {
  const radians = lat * Math.PI / 180
  return ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * 2 ** zoom
}

function getTileMap(city: City) {
  const center = CITY_CENTERS[city]
  const centerPxX = lngToTileX(center.lng, center.zoom) * TILE_SIZE
  const centerPxY = latToTileY(center.lat, center.zoom) * TILE_SIZE
  const leftPx = centerPxX - MAP_WIDTH / 2
  const topPx = centerPxY - MAP_HEIGHT / 2
  const startTileX = Math.floor(leftPx / TILE_SIZE)
  const startTileY = Math.floor(topPx / TILE_SIZE)
  const endTileX = Math.floor((leftPx + MAP_WIDTH) / TILE_SIZE)
  const endTileY = Math.floor((topPx + MAP_HEIGHT) / TILE_SIZE)
  const tiles: { x: number; y: number; left: number; top: number; url: string }[] = []

  for (let x = startTileX; x <= endTileX; x++) {
    for (let y = startTileY; y <= endTileY; y++) {
      tiles.push({
        x,
        y,
        left: x * TILE_SIZE - leftPx,
        top: y * TILE_SIZE - topPx,
        url: `https://a.basemaps.cartocdn.com/dark_all/${center.zoom}/${x}/${y}.png`,
      })
    }
  }

  return {
    ...center,
    leftPx,
    topPx,
    tiles,
    attribution: '© OpenStreetMap contributors © CARTO',
  }
}

function projectSpotOnTiles(spot: Spot, tileMap: ReturnType<typeof getTileMap>) {
  const x = lngToTileX(spot.coordinates[1], tileMap.zoom) * TILE_SIZE - tileMap.leftPx
  const y = latToTileY(spot.coordinates[0], tileMap.zoom) * TILE_SIZE - tileMap.topPx
  return { spot, x: x / MAP_WIDTH * 100, y: y / MAP_HEIGHT * 100 }
}

export default function MapPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [city, setCity] = useState<City>('marrakech')
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)

  const citySpots = useMemo(() => ALL_SPOTS.filter(spot => spot.city === city), [city])
  const filteredSpots = useMemo(
    () => citySpots.filter(spot => matchesFilter(spot, filter)).sort((a, b) => b.rarity - a.rarity),
    [citySpots, filter]
  )
  const tileMap = useMemo(() => getTileMap(city), [city])
  const projected = useMemo(
    () => filteredSpots.map(spot => projectSpotOnTiles(spot, tileMap)),
    [filteredSpots, tileMap]
  )

  return (
    <main className="rihla-screen relative min-h-dvh overflow-hidden pb-[calc(132px+env(safe-area-inset-bottom,0px))]">
      <RihlaFAB />

      <header className="absolute left-0 right-0 top-0 z-30 px-5 pt-safe-12">
        <div className="rounded-2xl border border-[#E8A838]/18 bg-[#0F0E0C]/78 p-4 backdrop-blur-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#E8A838]">{t(lang, 'living_map')}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <h1 className="text-[30px] font-semibold leading-none text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>
                {CITY_LABELS[city]}
              </h1>
              <p className="mt-1 text-[13px] text-[#B8A898]">{filteredSpots.length} {t(lang, 'spots_nearby')}</p>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8A838]/22 bg-[#E8A838]/10 text-[#E8A838]" aria-label="Center map">
              <LocateFixed size={17} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
          {CITY_IDS.map(id => (
            <button
              key={id}
              onClick={() => {
                setCity(id)
                setSelectedSpot(null)
              }}
              className="h-9 flex-shrink-0 rounded-full border px-4 text-[13px] font-semibold"
              style={{
                background: city === id ? '#C4622D' : 'rgba(26,24,21,0.82)',
                borderColor: city === id ? 'rgba(232,168,56,0.38)' : 'rgba(232,168,56,0.16)',
                color: city === id ? '#fff' : '#B8A898',
              }}
            >
              {CITY_LABELS[id]}
            </button>
          ))}
        </div>
      </header>

      <section className="absolute inset-0">
        <div className="absolute inset-0 bg-[#0F0E0C]" />
        <div className="absolute inset-x-0 bottom-[112px] top-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2"
            style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
          >
            {tileMap.tiles.map(tile => (
              <img
                key={`${tile.x}-${tile.y}`}
                src={tile.url}
                alt=""
                aria-hidden="true"
                className="absolute h-64 w-64 select-none"
                style={{ left: tile.left, top: tile.top }}
                draggable={false}
              />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(15,14,12,0.10)_45%,rgba(15,14,12,0.58)_100%)]" />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,14,12,0.72)_0%,rgba(15,14,12,0.10)_26%,rgba(15,14,12,0.12)_62%,rgba(15,14,12,0.76)_100%)]" />
          <div className="absolute bottom-[154px] right-5 rounded-full bg-[#0F0E0C]/72 px-2.5 py-1 text-[10px] text-[#B8A898] backdrop-blur">
            {tileMap.attribution}
          </div>
        </div>

        <div
          className="absolute left-1/2 top-1/2 z-10 origin-center -translate-x-1/2 -translate-y-1/2"
          style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
        >
          {projected.map(({ spot, x, y }) => {
            const hidden = spot.rarity >= 75
            const inPlan = false
            return (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform active:scale-90"
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-label={`${pick(spot.name as Record<string, string>, lang)}, rarity ${spot.rarity}`}
              >
                <span
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0F0E0C] text-white shadow-[0_8px_22px_rgba(0,0,0,0.34)]"
                  style={{
                    background: inPlan ? '#2A7F6F' : hidden ? '#E8A838' : '#C4622D',
                    color: hidden ? '#1A1206' : '#fff',
                  }}
                >
                  {inPlan ? <Check size={15} strokeWidth={2.4} /> : hidden ? <Sparkles size={15} strokeWidth={1.8} /> : <span className="h-2 w-2 rounded-full bg-current" />}
                  {hidden && <span className="absolute inset-[-5px] rounded-full border border-[#E8A838]/45 animate-ping" />}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="fixed bottom-[calc(72px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 rounded-t-[24px] border-t border-[#E8A838]/20 bg-[#1A1815]/94 px-5 pb-4 pt-3 backdrop-blur-2xl">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[#786858]" />
        <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {FILTERS.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setFilter(item.id)
                setSelectedSpot(null)
              }}
              className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold"
              style={{
                background: filter === item.id ? '#C4622D' : '#0F0E0C',
                borderColor: filter === item.id ? 'rgba(232,168,56,0.40)' : 'rgba(232,168,56,0.16)',
                color: filter === item.id ? '#fff' : '#B8A898',
              }}
            >
              {item.icon}
              {t(lang, item.labelKey)}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-[#F0E8D8]">{filteredSpots.length} {t(lang, 'all_spots').toLowerCase()} · {CITY_LABELS[city]}</p>
            <p className="mt-0.5 text-[12px] text-[#786858]">{t(lang, 'tap_marker')}</p>
          </div>
          <Gem size={18} color="#E8A838" strokeWidth={1.7} />
        </div>
      </section>

      <BottomSheet isOpen={selectedSpot !== null} onClose={() => setSelectedSpot(null)}>
        {selectedSpot && (
          <div>
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-[#E8A838]/18 bg-[#E8A838]/10 text-[#E8A838]">
                {selectedSpot.rarity >= 75 ? <Sparkles size={24} strokeWidth={1.7} /> : <MapPin size={24} strokeWidth={1.7} />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[24px] font-semibold leading-7 text-[#F0E8D8]" style={{ fontFamily: 'var(--font-display)' }}>
                  {pick(selectedSpot.name as Record<string, string>, lang)}
                </h2>
                <div className="mt-2">
                  <RarityBadge score={selectedSpot.rarity} size="sm" />
                </div>
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-6 text-[#B8A898]">
              {pick(selectedSpot.description as Record<string, string>, lang)}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => router.push(`/spot/${selectedSpot.id}`)}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#C4622D] text-[14px] font-semibold text-white shadow-[0_12px_36px_rgba(196,98,45,0.28)]"
              >
                {t(lang, 'explore')}
                <ChevronRight size={16} strokeWidth={1.8} />
              </button>
              <button
                onClick={() => setSelectedSpot(null)}
                className="h-12 rounded-lg border border-[#E8A838]/18 bg-[#0F0E0C] px-4 text-[14px] font-semibold text-[#D9CCB7]"
              >
                {t(lang, 'keep_looking')}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </main>
  )
}
