import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  POPULAR_IN_SARAJEVO_QUERY,
  SALONS_NEARBY_QUERY,
  type PopularInSarajevoData,
  type SalonsNearbyData,
} from '../graphql/discovery'
import { discoverySource, type DiscoverySource } from '../lib/discovery'

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

export function DiscoveryHome() {
  const { t } = useTranslation()
  const geo = useGeo()
  const source: DiscoverySource | null =
    geo.status === 'pending' ? null : discoverySource(geo.status)

  const nearby = useQuery<SalonsNearbyData>(SALONS_NEARBY_QUERY, {
    variables: geo.status === 'granted' ? { lat: geo.lat, lng: geo.lng } : undefined,
    skip: source !== 'nearby',
  })
  const popular = useQuery<PopularInSarajevoData>(POPULAR_IN_SARAJEVO_QUERY, {
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
      {loading || !source ? (
        <p className="mt-6 text-sm text-body">{t('salon.loading')}</p>
      ) : !salons || salons.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          {source === 'nearby' ? t('discovery.emptyNearby') : t('discovery.emptyPopular')}
        </p>
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
