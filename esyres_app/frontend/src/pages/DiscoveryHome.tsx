import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import {
  POPULAR_IN_SARAJEVO_QUERY,
  SALONS_NEARBY_QUERY,
  type DiscoverySalon,
  type DiscoveryVars,
  type PopularInSarajevoData,
  type SalonsNearbyData,
} from '../graphql/discovery'
import { busyToken } from '../lib/busyToken'
import {
  DISCOVERY_CATEGORIES,
  discoveryAddressLine,
  discoveryEmptyKey,
  discoveryHasFilter,
  discoveryListMode,
  discoverySalonCategories,
  discoveryShowAllVisible,
  discoverySource,
  discoveryVisibleSalons,
  type DiscoverySource,
  type ServiceCategory,
} from '../lib/discovery'
import { sarajevoToday } from '../lib/format'
import { GUEST_COLUMN_CLASS } from '../lib/homepage'

type Geo =
  | { status: 'pending' }
  | { status: 'granted'; lat: number; lng: number }
  | { status: 'denied' }
  | { status: 'unavailable' }

const busyBg = {
  'busy-free': 'bg-busy-free',
  'busy-moderate': 'bg-busy-moderate',
  'busy-busy': 'bg-busy-busy',
} as const

function useGeo(): Geo {
  const [geo, setGeo] = useState<Geo>({ status: 'pending' })

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeo({ status: 'unavailable' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ status: 'granted', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeo({ status: 'denied' }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    )
  }, [])

  return geo
}

function useDebounced(value: string, ms: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(id)
  }, [value, ms])
  return debounced
}

function filterVars(category: ServiceCategory | null, name: string): Pick<DiscoveryVars, 'category' | 'name'> {
  const vars: Pick<DiscoveryVars, 'category' | 'name'> = {}
  if (category) {
    vars.category = category
  }
  const term = name.trim()
  if (term !== '') {
    vars.name = term
  }
  return vars
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SalonFacts({ salon }: { salon: DiscoverySalon }) {
  const { t } = useTranslation()
  const token = busyToken(salon.busyLevel)
  const categories = discoverySalonCategories(salon.services)
  const address = discoveryAddressLine(salon.address)

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-medium text-ink">{salon.name}</span>
        <span className="flex items-center gap-2 text-sm text-body">
          <span className={`size-2.5 shrink-0 rounded-full ${busyBg[token]}`} aria-hidden />
          {t(`salon.busy.${salon.busyLevel}`)}
        </span>
      </div>
      {categories.length > 0 ? (
        <p className="mt-1 text-sm text-muted">
          {categories.map((c) => t(`category.${c}`)).join(', ')}
        </p>
      ) : null}
      {address !== null ? <p className="mt-1 text-sm text-muted">{address}</p> : null}
    </>
  )
}

export function DiscoveryHome() {
  const { t } = useTranslation()
  const geo = useGeo()
  const [category, setCategory] = useState<ServiceCategory | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [showAll, setShowAll] = useState(false)
  const name = useDebounced(nameDraft, 300)
  const source: DiscoverySource | null =
    geo.status === 'pending' ? null : discoverySource(geo.status)
  const vars = filterVars(category, name)
  const filtered = discoveryHasFilter(category, name)
  const date = sarajevoToday()

  useEffect(() => {
    if (filtered) {
      setShowAll(false)
    }
  }, [filtered])

  const nearby = useQuery<SalonsNearbyData>(SALONS_NEARBY_QUERY, {
    variables: geo.status === 'granted' ? { lat: geo.lat, lng: geo.lng, date, ...vars } : undefined,
    skip: source !== 'nearby',
  })
  const popular = useQuery<PopularInSarajevoData>(POPULAR_IN_SARAJEVO_QUERY, {
    variables: { date, ...vars },
    skip: source !== 'popular',
  })

  const loading = geo.status === 'pending' || nearby.loading || popular.loading
  const salons =
    source === 'nearby' ? nearby.data?.salonsNearby : source === 'popular' ? popular.data?.popularInSarajevo : undefined
  const listMode = discoveryListMode({ filtered, showAll })
  const visible = salons === undefined ? [] : discoveryVisibleSalons(salons, listMode)
  const showAllButton = salons !== undefined && discoveryShowAllVisible(salons.length, listMode)

  return (
    <>
      <TopNav />
      <main className={`${GUEST_COLUMN_CLASS} py-8`}>
      {source ? (
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
          {source === 'nearby' ? t('discovery.nearby') : t('discovery.popular')}
        </h1>
      ) : null}
      <div className="mt-4 flex gap-2">
        {DISCOVERY_CATEGORIES.map((chip) => {
          const on = category === chip
          return (
            <button
              key={chip}
              type="button"
              aria-pressed={on}
              onClick={() => setCategory(on ? null : chip)}
              className={
                on
                  ? 'rounded-full bg-ink px-3 py-1 text-sm text-canvas'
                  : 'rounded-full border border-hairline px-3 py-1 text-sm text-body'
              }
            >
              {t(`category.${chip}`)}
            </button>
          )
        })}
      </div>
      <div className="relative mt-4">
        <SearchIcon />
        <input
          type="search"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          placeholder={t('discovery.searchPlaceholder')}
          aria-label={t('discovery.searchPlaceholder')}
          className="w-full rounded-md border border-hairline bg-canvas py-3 pl-10 pr-3 text-sm text-ink placeholder:text-muted"
        />
      </div>
      {loading || !source ? (
        <p className="mt-6 text-sm text-body">{t('salon.loading')}</p>
      ) : !salons || salons.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{t(discoveryEmptyKey(source, filtered))}</p>
      ) : listMode === 'teaser' ? (
        <>
          <ul className="mt-6 space-y-3">
            {visible.map((salon) => (
              <li key={salon.id}>
                <Link
                  to={`/salon/${salon.id}`}
                  className="block rounded-lg bg-surface-card p-4"
                >
                  <SalonFacts salon={salon} />
                </Link>
              </li>
            ))}
          </ul>
          {showAllButton ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-4 text-sm font-medium text-ink"
            >
              {t('discovery.showAll')}
            </button>
          ) : null}
        </>
      ) : (
        <ul className="mt-6 divide-y divide-hairline">
          {visible.map((salon) => (
            <li key={salon.id}>
              <Link to={`/salon/${salon.id}`} className="block py-3">
                <SalonFacts salon={salon} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      </main>
    </>
  )
}
