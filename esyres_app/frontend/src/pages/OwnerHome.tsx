import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { PENDING_BOOKINGS_QUERY, type PendingBookingsData } from '../graphql/pending'
import { sarajevoToday } from '../lib/format'
import { formatSarajevoTime, isPreferredSoon, ownerDateFromSearch } from '../lib/owner'

export function OwnerHome() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const date = ownerDateFromSearch(params.get('date'))
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const salon = data?.me?.salons[0] ?? null
  const { data: queue, loading: queueLoading } = useQuery<PendingBookingsData>(PENDING_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date },
    skip: salon === null || data?.me?.emailVerified !== true,
  })

  function onDate(value: string) {
    const next = ownerDateFromSearch(value)
    if (next === sarajevoToday()) {
      setParams({})
      return
    }
    setParams({ date: next })
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
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.title')}</h1>
        <div className="mt-8">
          <AuthShell allowRegister={false} onAuthenticated={() => refetch()} />
        </div>
      </main>
    )
  }

  if (!data.me.emailVerified) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.title')}</h1>
        <div className="mt-8">
          <EmailVerifyPanel />
        </div>
      </main>
    )
  }

  if (salon === null) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.title')}</h1>
        <p className="mt-8 text-sm text-body">{t('owner.notOwner')}</p>
      </main>
    )
  }

  const rows = queue?.pendingBookings ?? []

  return (
    <div className="min-h-svh md:flex">
      <aside className="hidden bg-surface-dark px-5 py-8 text-on-dark md:flex md:w-56 md:shrink-0 md:flex-col">
        <p className="text-sm font-semibold">{salon.name}</p>
        <p className="mt-6 text-sm font-medium">{t('owner.title')}</p>
      </aside>
      <main className="flex-1 px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink md:hidden">{t('owner.title')}</h1>
        <p className="mt-1 text-sm text-body md:hidden">{salon.name}</p>
        <label className="mt-6 block max-w-xs text-sm text-body">
          {t('owner.date')}
          <input
            type="date"
            value={date}
            onChange={(e) => onDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
          />
        </label>
        {queueLoading ? (
          <p className="mt-8 text-sm text-body">{t('salon.loading')}</p>
        ) : rows.length === 0 ? (
          <p className="mt-8 text-sm text-body">{t('owner.empty')}</p>
        ) : (
          <ul className="mt-8 max-w-xl space-y-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-hairline bg-canvas px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-ink">{formatSarajevoTime(row.preferredStartsAt)}</p>
                  {isPreferredSoon(row.preferredStartsAt) ? (
                    <span className="rounded-sm bg-cell-pending px-2 py-0.5 text-xs font-semibold text-ink">
                      {t('owner.soon')}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-ink">{row.customerName}</p>
                <p className="mt-1 text-sm text-body">
                  {row.services.map((s) => s.name).join(', ')}
                  {' · '}
                  {t('salon.duration', { n: row.durationMinutes })}
                  {' · '}
                  {row.worker ? row.worker.name : t('salon.noPreference')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
