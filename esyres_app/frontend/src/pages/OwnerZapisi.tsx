import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { TopNav } from '../components/TopNav'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import {
  SALON_DAY_BOOKINGS_QUERY,
  type SalonDayBookingsData,
  type ZapisiBooking,
} from '../graphql/pending'
import { CREATE_SALON_PATH } from '../lib/createSalon'
import { formatSarajevoTime, sarajevoToday } from '../lib/format'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import {
  currentJobLabel,
  ownerDateFromSearch,
  ownerSalonFromSearch,
  ownerZapisiSearchParams,
  requestFromZapisiPath,
  zapisiOriginFromSearch,
  type ZapisiOrigin,
} from '../lib/owner'
import { useOwnerPush } from '../lib/push'

export function OwnerZapisi() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const navMe = loading ? null : (data?.me ?? null)
  const salons = data?.me?.salons ?? []
  const salonId = ownerSalonFromSearch(params.get('salon'), salons)
  const salon = salons.find((row) => row.id === salonId) ?? null
  const ownerReady = salon !== null && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const today = sarajevoToday()
  const date = ownerDateFromSearch(params.get('date'), today)
  const origin = zapisiOriginFromSearch(params.get('origin'))
  const firstOwnedId = salons[0]?.id ?? ''
  const { data: countData } = useQuery<InFlightIntakeCountData>(IN_FLIGHT_INTAKE_COUNT_QUERY, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const { data: listData, loading: listLoading } = useQuery<SalonDayBookingsData>(SALON_DAY_BOOKINGS_QUERY, {
    variables: {
      salonId: salon?.id ?? '',
      date,
      origin: origin === null ? null : origin.toUpperCase(),
    },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const badge = chatBadgeCount(countData?.inFlightIntakeCount ?? 0)
  const rows = listData?.salonDayBookings ?? []

  function write(nextDate: string, nextSalon: string, nextOrigin: ZapisiOrigin | null) {
    setParams(ownerZapisiSearchParams(nextDate, today, nextSalon, firstOwnedId, nextOrigin))
  }

  if (loading) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="px-5 py-8 text-body">
          <p>{t('salon.loading')}</p>
        </main>
      </>
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
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.zapisi')}</h1>
          <p className="mt-8 text-sm text-body">{t('owner.notOwner')}</p>
          <Link to={CREATE_SALON_PATH} className="mt-4 inline-block text-sm font-semibold text-ink">
            {t('owner.createSalon')}
          </Link>
        </main>
      </>
    )
  }

  const chips: { id: ZapisiOrigin | null; label: string }[] = [
    { id: null, label: t('owner.originAll') },
    { id: 'picker', label: t('owner.originGuest') },
    { id: 'assistant', label: t('owner.assistant') },
    { id: 'phone', label: t('owner.phone.button') },
  ]

  return (
    <>
      <TopNav me={navMe} />
      <div className="min-h-svh md:flex">
        <aside className="hidden border-r border-hairline bg-canvas px-5 py-8 text-ink md:flex md:w-56 md:shrink-0 md:flex-col">
          <Switcher salons={salons} salon={salon} onSalon={(id) => write(date, id, origin)} />
          <OwnerNav salonId={salon.id} firstOwnedId={firstOwnedId} date={date} badge={badge} active="zapisi" />
        </aside>
        <main className="flex-1 px-5 py-8 text-ink">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.zapisi')}</h1>
          <div className="md:hidden">
            <Switcher salons={salons} salon={salon} onSalon={(id) => write(date, id, origin)} />
            <OwnerNav salonId={salon.id} firstOwnedId={firstOwnedId} date={date} badge={badge} active="zapisi" />
          </div>
          <label className="mt-6 block text-sm">
            {t('owner.date')}
            <input
              type="date"
              value={date}
              onChange={(e) => {
                if (e.target.value !== '') {
                  write(e.target.value, salon.id, origin)
                }
              }}
              className="mt-1 block rounded-md border border-hairline bg-canvas px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <div className="mt-4 flex gap-3 text-sm">
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => write(date, salon.id, chip.id)}
                className={origin === chip.id ? 'font-semibold text-ink' : 'text-body'}
              >
                {chip.label}
              </button>
            ))}
          </div>
          {listLoading && listData === undefined ? (
            <p className="mt-6 text-sm text-body">{t('salon.loading')}</p>
          ) : (
            <ul className="mt-6">
              {rows.map((row) => (
                <li key={row.id}>
                  <Link
                    to={requestFromZapisiPath(row.id, date, today, salon.id, firstOwnedId, origin)}
                    className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 border-b border-hairline py-2 text-sm"
                  >
                    <span className="tabular-nums text-ink">{formatSarajevoTime(rowStart(row))}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">{row.customerName}</span>
                      <span className="mt-1 block text-body">
                        {originLabel(t, row.origin)}
                        {' · '}
                        {currentJobLabel(row.services)}
                        {' · '}
                        {t(`bookings.status.${row.status}`)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </>
  )
}

function rowStart(row: ZapisiBooking): string {
  if (row.status === 'TIME_PROPOSED' && row.proposedStartsAt !== null) {
    return row.proposedStartsAt
  }

  return row.preferredStartsAt
}

function originLabel(t: (key: string) => string, origin: ZapisiBooking['origin']): string {
  if (origin === 'ASSISTANT') {
    return t('owner.assistant')
  }
  if (origin === 'PHONE') {
    return t('owner.phone.button')
  }

  return t('owner.originGuest')
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
          className="mt-1 w-full rounded-md border border-hairline bg-canvas px-2 py-1.5 text-sm text-ink"
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
