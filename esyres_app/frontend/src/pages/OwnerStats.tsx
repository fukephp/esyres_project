import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerShell } from '../components/OwnerShell'
import { TopNav } from '../components/TopNav'
import { OwnerPageSkeleton, TilesSkeleton } from '../components/Skeleton'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import {
  SALON_QR_STATS_QUERY,
  SALON_STATS_QUERY,
  type SalonQrStatsData,
  type SalonStatsData,
} from '../graphql/stats'
import { chatBadgeCount } from '../lib/intake'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { ownerChatSearchParams, ownerSalonFromSearch, statsHourLabel } from '../lib/owner'
import { useOwnerPush } from '../lib/push'

export function OwnerStats() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const navMe = loading ? null : (data?.me ?? null)
  const salons = data?.me?.salons ?? []
  const salonId = ownerSalonFromSearch(params.get('salon'), salons)
  const salon = salons.find((row) => row.id === salonId) ?? null
  const ownerReady = salon !== null && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const { data: countData } = useQuery<InFlightIntakeCountData>(IN_FLIGHT_INTAKE_COUNT_QUERY, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const { data: statsData, loading: statsLoading } = useQuery<SalonStatsData>(SALON_STATS_QUERY, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const { data: qrData, loading: qrLoading } = useQuery<SalonQrStatsData>(SALON_QR_STATS_QUERY, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const badge = chatBadgeCount(countData?.inFlightIntakeCount ?? 0)
  const firstOwnedId = salons[0]?.id ?? ''
  const stats = statsData?.salonStats ?? null
  const qr = qrData?.salonQrStats
  const scans = qr?.scanCount ?? 0
  const visits = qr?.visitCount ?? 0
  const percent = qr?.conversionPercent ?? 0

  function onSalon(id: string) {
    setParams(ownerChatSearchParams(id, firstOwnedId))
  }

  if (loading) {
    return (
      <OwnerPageSkeleton>
        <TilesSkeleton />
      </OwnerPageSkeleton>
    )
  }

  if (data?.me == null) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="mx-auto max-w-md px-5 py-8">
          <h1 className={PLACE_HEADING_CLASS}>{t('auth.placePanel')}</h1>
          <div className="mt-8">
            <AuthShell allowRegister={false} onAuthenticated={() => refetch()} />
          </div>
        </main>
      </>
    )
  }

  if (!data.me.emailVerified) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="mx-auto max-w-md px-5 py-8">
          <h1 className={PLACE_HEADING_CLASS}>{t('auth.placePanel')}</h1>
          <div className="mt-8">
            <EmailVerifyPanel />
          </div>
        </main>
      </>
    )
  }

  if (salon === null) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="mx-auto max-w-md px-5 py-8">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.stats')}</h1>
          <p className="mt-8 text-sm text-body">{t('owner.notOwner')}</p>
        </main>
      </>
    )
  }

  return (
    <>
      <OwnerShell
        personName={data.me.name}
        title={t('owner.stats')}
        salons={salons}
        salonId={salon.id}
        firstOwnedId={firstOwnedId}
        badge={badge}
        active="stats"
        onSalon={onSalon}
      >
        {(statsLoading && stats === null) || (qrLoading && qr === undefined) ? (
          <TilesSkeleton className="max-w-3xl" />
        ) : (
          <div className="max-w-3xl">
            {stats === null ? null : (
              <>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-pastel-yellow p-4">
                    <dt className="micro-label text-ink">{t('owner.statsBookings')}</dt>
                    <dd className="font-display mt-2 text-[32px] font-semibold text-ink">{stats.bookingsCount}</dd>
                  </div>
                  <div className="rounded-2xl bg-pastel-pink p-4">
                    <dt className="micro-label text-ink">{t('owner.statsRate')}</dt>
                    <dd className="font-display mt-2 text-[32px] font-semibold text-ink">{stats.cancellationRatePercent}%</dd>
                  </div>
                  <div className="rounded-2xl bg-pastel-blue p-4">
                    <dt className="micro-label text-ink">{t('owner.statsLate')}</dt>
                    <dd className="font-display mt-2 text-[32px] font-semibold text-ink">{stats.lateCancels}</dd>
                  </div>
                </dl>
                {stats.bookingsCount === 0 ? (
                  <p className="mt-6 text-sm text-body">{t('owner.statsEmpty')}</p>
                ) : null}
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <ul className="rounded-3xl bg-canvas p-5">
                    {stats.days.map((day) => (
                      <li key={day.date} className="flex items-baseline justify-between gap-3 border-b border-hairline py-2 text-sm last:border-b-0">
                        <span className="font-medium text-ink">{t(`weekday.${day.weekday}`)}</span>
                        <span className="text-body">
                          {day.bookingsCount} · {t('owner.statsBusy')} {day.busyPercent}%
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-3xl bg-canvas p-5">
                    <h2 className="micro-label text-muted">{t('owner.statsHours')}</h2>
                    {stats.hours.length === 0 ? null : (
                      <ul className="mt-2 space-y-2">
                        {stats.hours.map((row) => (
                          <li key={row.hour} className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="text-ink">{statsHourLabel(row.hour)}</span>
                            <span className="text-body">{row.bookingsCount}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-surface-card p-4">
                <dt className="micro-label text-muted">{t('owner.qrScans')}</dt>
                <dd className="font-display mt-2 text-[28px] font-semibold tracking-tight text-ink">{scans}</dd>
              </div>
              <div className="rounded-2xl bg-surface-card p-4">
                <dt className="micro-label text-muted">{t('owner.qrVisits')}</dt>
                <dd className="font-display mt-2 text-[28px] font-semibold tracking-tight text-ink">{visits}</dd>
              </div>
              <div className="rounded-2xl bg-pastel-green p-4">
                <dt className="micro-label text-ink">{t('owner.qrConversion')}</dt>
                <dd className="font-display mt-2 text-[28px] font-semibold tracking-tight text-ink">{t('owner.qrPercent', { n: percent })}</dd>
              </div>
            </dl>
          </div>
        )}
      </OwnerShell>
    </>
  )
}

