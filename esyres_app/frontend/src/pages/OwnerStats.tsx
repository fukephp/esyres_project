import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import { SALON_STATS_QUERY, type SalonStatsData } from '../graphql/stats'
import { chatBadgeCount } from '../lib/intake'
import { ownerChatSearchParams, ownerSalonFromSearch, statsHourLabel } from '../lib/owner'
import { useOwnerPush } from '../lib/push'

export function OwnerStats() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
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
  const badge = chatBadgeCount(countData?.inFlightIntakeCount ?? 0)
  const firstOwnedId = salons[0]?.id ?? ''
  const stats = statsData?.salonStats ?? null

  function onSalon(id: string) {
    setParams(ownerChatSearchParams(id, firstOwnedId))
  }

  if (loading) {
    return (
      <main className="px-5 py-8 text-body">
        <p>{t('salon.loading')}</p>
      </main>
    )
  }

  if (data?.me == null) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.stats')}</h1>
        <div className="mt-8">
          <AuthShell allowRegister={false} onAuthenticated={() => refetch()} />
        </div>
      </main>
    )
  }

  if (!data.me.emailVerified) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.stats')}</h1>
        <div className="mt-8">
          <EmailVerifyPanel />
        </div>
      </main>
    )
  }

  if (salon === null) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.stats')}</h1>
        <p className="mt-8 text-sm text-body">{t('owner.notOwner')}</p>
      </main>
    )
  }

  return (
    <div className="min-h-svh md:flex">
      <aside className="hidden bg-surface-dark px-5 py-8 text-on-dark md:flex md:w-56 md:shrink-0 md:flex-col">
        <Switcher salons={salons} salon={salon} onSalon={onSalon} />
        <OwnerNav
          salonId={salon.id}
          firstOwnedId={firstOwnedId}
          badge={badge}
          active="stats"
          tone="dark"
        />
      </aside>
      <main className="flex-1 px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink md:hidden">{t('owner.stats')}</h1>
        <div className="md:hidden">
          <Switcher salons={salons} salon={salon} onSalon={onSalon} />
          <OwnerNav
            salonId={salon.id}
            firstOwnedId={firstOwnedId}
            badge={badge}
            active="stats"
            tone="light"
          />
        </div>
        {statsLoading || stats === null ? (
          <p className="mt-8 text-sm text-body">{t('salon.loading')}</p>
        ) : (
          <div className="mt-8 max-w-xl">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-body">{t('owner.statsBookings')}</dt>
                <dd className="mt-1 text-lg font-semibold text-ink">{stats.bookingsCount}</dd>
              </div>
              <div>
                <dt className="text-sm text-body">{t('owner.statsRate')}</dt>
                <dd className="mt-1 text-lg font-semibold text-ink">{stats.cancellationRatePercent}%</dd>
              </div>
              <div>
                <dt className="text-sm text-body">{t('owner.statsLate')}</dt>
                <dd className="mt-1 text-lg font-semibold text-ink">{stats.lateCancels}</dd>
              </div>
            </dl>
            {stats.bookingsCount === 0 ? (
              <p className="mt-6 text-sm text-body">{t('owner.statsEmpty')}</p>
            ) : null}
            <ul className="mt-8 space-y-2">
              {stats.days.map((day) => (
                <li key={day.date} className="flex items-baseline justify-between gap-3 border-b border-hairline py-2 text-sm">
                  <span className="font-medium text-ink">{t(`weekday.${day.weekday}`)}</span>
                  <span className="text-body">
                    {day.bookingsCount} · {t('owner.statsBusy')} {day.busyPercent}%
                  </span>
                </li>
              ))}
            </ul>
            <h2 className="mt-8 text-sm font-semibold text-ink">{t('owner.statsHours')}</h2>
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
        )}
      </main>
    </div>
  )
}

function Switcher({
  salons,
  salon,
  onSalon,
}: {
  salons: { id: string; name: string }[]
  salon: { id: string; name: string }
  onSalon: (id: string) => void
}) {
  const { t } = useTranslation()
  if (salons.length > 1) {
    return (
      <label className="block text-sm">
        {t('owner.salon')}
        <select
          value={salon.id}
          onChange={(e) => onSalon(e.target.value)}
          className="mt-1 w-full rounded-md border border-hairline bg-canvas px-2 py-1.5 text-sm text-ink md:border-white/20 md:bg-surface-dark md:text-on-dark"
        >
          {salons.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return <p className="text-sm font-semibold">{salon.name}</p>
}
