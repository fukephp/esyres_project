import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  POPULAR_IN_SARAJEVO_QUERY,
  SALONS_NEARBY_QUERY,
  type DiscoveryVars,
  type PopularInSarajevoData,
  type SalonsNearbyData,
} from '../graphql/discovery'
import {
  DISCOVERY_CATEGORIES,
  discoveryEmptyKey,
  discoveryHasFilter,
  discoverySource,
  type DiscoverySource,
  type ServiceCategory,
} from '../lib/discovery'

type Geo =
  | { status: 'pending' }
  | { status: 'granted'; lat: number; lng: number }
  | { status: 'denied' }
  | { status: 'unavailable' }

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

function filterVars(category: ServiceCategory | null, name: string): DiscoveryVars {
  const vars: DiscoveryVars = {}
  if (category) {
    vars.category = category
  }
  const term = name.trim()
  if (term !== '') {
    vars.name = term
  }
  return vars
}

export function DiscoveryHome() {
  const { t } = useTranslation()
  const geo = useGeo()
  const [category, setCategory] = useState<ServiceCategory | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const name = useDebounced(nameDraft, 300)
  const source: DiscoverySource | null =
    geo.status === 'pending' ? null : discoverySource(geo.status)
  const vars = filterVars(category, name)
  const filtered = discoveryHasFilter(category, name)

  const nearby = useQuery<SalonsNearbyData>(SALONS_NEARBY_QUERY, {
    variables: geo.status === 'granted' ? { lat: geo.lat, lng: geo.lng, ...vars } : undefined,
    skip: source !== 'nearby',
  })
  const popular = useQuery<PopularInSarajevoData>(POPULAR_IN_SARAJEVO_QUERY, {
    variables: vars,
    skip: source !== 'popular',
  })

  const loading = geo.status === 'pending' || nearby.loading || popular.loading
  const salons =
    source === 'nearby' ? nearby.data?.salonsNearby : source === 'popular' ? popular.data?.popularInSarajevo : undefined

  return (
    <main className="mx-auto max-w-md px-5 py-8">
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
      <input
        type="search"
        value={nameDraft}
        onChange={(e) => setNameDraft(e.target.value)}
        placeholder={t('discovery.searchPlaceholder')}
        aria-label={t('discovery.searchPlaceholder')}
        className="mt-4 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted"
      />
      {loading || !source ? (
        <p className="mt-6 text-sm text-body">{t('salon.loading')}</p>
      ) : !salons || salons.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{t(discoveryEmptyKey(source, filtered))}</p>
      ) : (
        <ul className="mt-6 divide-y divide-hairline">
          {salons.map((salon) => (
            <li key={salon.id}>
              <Link
                to={`/salon/${salon.id}`}
                className="block py-3 text-sm font-medium text-ink"
              >
                {salon.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
