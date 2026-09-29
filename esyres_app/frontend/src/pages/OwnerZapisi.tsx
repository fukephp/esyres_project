import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { BoardColumn, BookingCard, DayChips, KanbanBoard, WeekHeader } from '../components/OwnerBoards'
import { OwnerShell } from '../components/OwnerShell'
import { TopNav } from '../components/TopNav'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import { SALON_DAY_BOOKINGS_QUERY, type SalonDayBookingsData } from '../graphql/pending'
import { CREATE_SALON_PATH } from '../lib/createSalon'
import { formatSarajevoTime, sarajevoToday } from '../lib/format'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import {
  KANBAN_COLUMNS,
  bookingStartIso,
  kanbanGroups,
  ownerDateFromSearch,
  ownerSalonFromSearch,
  ownerWeekDays,
  ownerZapisiSearchParams,
  requestFromZapisiPath,
  shiftOwnerDate,
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
  const kanban = data?.me?.ownerView === 'KANBAN'
  const days = ownerWeekDays(date)
  const groups = kanbanGroups(rows)

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
      <OwnerShell
        personName={data.me.name}
        title={t('owner.zapisi')}
        salons={salons}
        salonId={salon.id}
        firstOwnedId={firstOwnedId}
        date={date}
        badge={badge}
        active="zapisi"
        onSalon={(id) => write(date, id, origin)}
      >
        <section className="rounded-3xl bg-canvas p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <WeekHeader days={days} onShift={(delta) => write(shiftOwnerDate(date, delta), salon.id, origin)} />
            <div className="flex flex-wrap gap-1.5 text-sm">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  aria-pressed={origin === chip.id}
                  onClick={() => write(date, salon.id, chip.id)}
                  className={
                    origin === chip.id
                      ? 'rounded-full bg-ink px-4 py-1.5 font-semibold text-canvas'
                      : 'rounded-full bg-surface-card px-4 py-1.5 text-body'
                  }
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
          <DayChips days={days} date={date} closedFor={() => false} onDate={(ymd) => write(ymd, salon.id, origin)} className="mt-4" />
          {listLoading && listData === undefined ? (
            <p className="mt-6 text-sm text-body">{t('salon.loading')}</p>
          ) : kanban ? (
            <KanbanBoard>
              {KANBAN_COLUMNS.map((column) => (
                <BoardColumn key={column} column={column} count={groups[column].length}>
                  {groups[column].map((row) => (
                    <BookingCard key={row.id} row={row} to={requestFromZapisiPath(row.id, date, today, salon.id, firstOwnedId, origin)} />
                  ))}
                </BoardColumn>
              ))}
            </KanbanBoard>
          ) : rows.length === 0 ? (
            <p className="mt-6 text-sm text-muted">{t('owner.noBookings')}</p>
          ) : (
            <ul className="mt-5 space-y-2">
              {[...rows]
                .sort((a, b) => bookingStartIso(a).localeCompare(bookingStartIso(b)))
                .map((row) => (
                  <li key={row.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-2">
                    <span className="pt-3 text-sm tabular-nums text-muted">{formatSarajevoTime(bookingStartIso(row))}</span>
                    <BookingCard row={row} to={requestFromZapisiPath(row.id, date, today, salon.id, firstOwnedId, origin)} />
                  </li>
                ))}
            </ul>
          )}
        </section>
      </OwnerShell>
    </>
  )
}
