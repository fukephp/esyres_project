import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { PhoneBookingDialog } from './OwnerPhoneBooking'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerShell } from '../components/OwnerShell'
import { TopNav } from '../components/TopNav'
import { ColumnSkeleton, OwnerPageSkeleton, OwnerWeekSkeleton, WeekGridSkeleton } from '../components/Skeleton'
import { ME_QUERY, type MeData } from '../graphql/auth'
import {
  IN_FLIGHT_INTAKE_COUNT_QUERY,
  type InFlightIntakeCountData,
} from '../graphql/intake'
import {
  ACCEPT_PREFERRED_TIME_MUTATION,
  ACCEPT_RESCHEDULE_MUTATION,
  BOOKING_CUSTOMER_RESPONDED_SUBSCRIPTION,
  BOOKING_RESCHEDULED_SUBSCRIPTION,
  BOOKING_CANCELLED_SUBSCRIPTION,
  DECLINE_BOOKING_MUTATION,
  DISMISS_RESCHEDULE_MUTATION,
  OCCUPYING_BOOKINGS_RANGE_QUERY,
  OWNER_SALON_QUERY,
  PENDING_BOOKINGS_QUERY,
  PENDING_JUMP_QUERY,
  SALON_DAY_BOOKINGS_QUERY,
  type OccupyingBookingsRangeData,
  type OwnerSalonData,
  type PendingBooking,
  type PendingBookingsData,
  type PendingJumpData,
  type SalonDayBookingsData,
} from '../graphql/pending'
import { BoardColumn, BookingCard, DayChips, KanbanBoard, WeekGrid, WeekHeader } from '../components/OwnerBoards'
import { graphqlErrorCode } from '../lib/booking'
import { CREATE_SALON_PATH } from '../lib/createSalon'
import { sarajevoToday } from '../lib/format'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import { useOwnerPush } from '../lib/push'
import { formatPickerDayNumeric } from '../lib/salonHours'
import {
  acceptErrorKey,
  assistantOriginVisible,
  canAcceptPreferredTime,
  declineErrorKey,
  hoursForDate,
  isPreferredSoon,
  kanbanGroups,
  occupiedElapsedShare,
  occupyingSarajevoYmd,
  nextPendingDay,
  boardSearchParams,
  ownerDateFromSearch,
  ownerSalonFromSearch,
  ownerSearchParams,
  ownerWeekDays,
  overlayQueueChrome,
  queueChipInitial,
  queueRowLabel,
  shiftOwnerDate,
  sarajevoWeekday,
  trimDeclineReason,
} from '../lib/owner'

export function OwnerHome({
  lockedSearch,
  hideSwitcher = false,
}: {
  lockedSearch?: string
  hideSwitcher?: boolean
} = {}) {
  const { t } = useTranslation()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  const [params, setParams] = useSearchParams()
  const boardParams = lockedSearch === undefined ? params : boardSearchParams(lockedSearch)
  const date = ownerDateFromSearch(boardParams.get('date'))
  const days = ownerWeekDays(date)
  const week = { from: days[0], to: days[6] }
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const kanban = data?.me?.ownerView === 'KANBAN'
  const navMe = loading ? null : (data?.me ?? null)
  const salons = data?.me?.salons ?? []
  const salonId = ownerSalonFromSearch(boardParams.get('salon'), salons)
  const salon = salons.find((row) => row.id === salonId) ?? null
  const ownerReady = salon !== null && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const { data: queue, loading: queueLoading, refetch: refetchQueue } = useQuery<PendingBookingsData>(PENDING_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date, limit: 50 },
    skip: !ownerReady,
  })
  const { data: jumpData, loading: jumpLoading, refetch: refetchJump } = useQuery<PendingJumpData>(PENDING_JUMP_QUERY, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
  })
  const jump = jumpLoading ? undefined : jumpData?.pendingJump
  const { data: board } = useQuery<OwnerSalonData>(OWNER_SALON_QUERY, {
    variables: { id: salon?.id ?? '' },
    skip: !ownerReady,
  })
  const { data: occupyingRange, refetch: refetchRange } = useQuery<OccupyingBookingsRangeData>(OCCUPYING_BOOKINGS_RANGE_QUERY, {
    variables: { salonId: salon?.id ?? '', from: week.from, to: week.to },
    skip: !ownerReady || kanban,
    fetchPolicy: 'cache-and-network',
  })
  const { data: dayBookings, refetch: refetchDay } = useQuery<SalonDayBookingsData>(SALON_DAY_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date, origin: null },
    skip: !ownerReady || !kanban,
    fetchPolicy: 'cache-and-network',
  })
  function refetchAll() {
    void refetchQueue()
    void refetchJump()
    if (kanban) {
      void refetchDay()
    } else {
      void refetchRange()
    }
  }
  useSubscription(BOOKING_CUSTOMER_RESPONDED_SUBSCRIPTION, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    onData: () => {
      refetchAll()
    },
  })
  useSubscription(BOOKING_RESCHEDULED_SUBSCRIPTION, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    onData: () => {
      refetchAll()
    },
  })
  useSubscription(BOOKING_CANCELLED_SUBSCRIPTION, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    onData: () => {
      refetchAll()
    },
  })
  const { data: chatCount } = useQuery<InFlightIntakeCountData>(IN_FLIGHT_INTAKE_COUNT_QUERY, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const [accept] = useMutation(ACCEPT_PREFERRED_TIME_MUTATION)
  const [acceptReschedule] = useMutation(ACCEPT_RESCHEDULE_MUTATION)
  const [dismissReschedule] = useMutation(DISMISS_RESCHEDULE_MUTATION)
  const [decline] = useMutation(DECLINE_BOOKING_MUTATION)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [declineId, setDeclineId] = useState<string | null>(null)
  const [dismissId, setDismissId] = useState<string | null>(null)
  const [reasonDraft, setReasonDraft] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phoneOpen, setPhoneOpen] = useState(false)

  function onDate(value: string) {
    if (lockedSearch !== undefined) {
      return
    }
    setParams(ownerSearchParams(ownerDateFromSearch(value), sarajevoToday(), salonId, salons[0]?.id ?? null))
  }

  function onSalon(id: string) {
    if (lockedSearch !== undefined) {
      return
    }
    setPhoneOpen(false)
    setParams(ownerSearchParams(date, sarajevoToday(), id, salons[0]?.id ?? null))
  }

  function refetchBoard() {
    if (salon === null) {
      return []
    }
    return [
      { query: PENDING_BOOKINGS_QUERY, variables: { salonId: salon.id, date, limit: 50 } },
      { query: PENDING_JUMP_QUERY, variables: { salonId: salon.id } },
      kanban
        ? { query: SALON_DAY_BOOKINGS_QUERY, variables: { salonId: salon.id, date, origin: null } }
        : { query: OCCUPYING_BOOKINGS_RANGE_QUERY, variables: { salonId: salon.id, from: week.from, to: week.to } },
    ]
  }

  async function onAccept(row: PendingBooking) {
    if (salon === null) {
      return
    }
    setBusyId(row.id)
    setErrors((current) => {
      const next = { ...current }
      delete next[row.id]
      return next
    })
    try {
      const mutate = row.reschedulePending ? acceptReschedule : accept
      await mutate({
        variables: { bookingId: row.id },
        refetchQueries: refetchBoard(),
      })
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [row.id]: t(`owner.acceptError.${acceptErrorKey(graphqlErrorCode(error))}`),
      }))
    } finally {
      setBusyId(null)
    }
  }

  async function onDecline(row: PendingBooking) {
    if (salon === null) {
      return
    }
    setBusyId(row.id)
    setErrors((current) => {
      const next = { ...current }
      delete next[row.id]
      return next
    })
    const reason = trimDeclineReason(reasonDraft)
    try {
      await decline({
        variables: { bookingId: row.id, reason },
        refetchQueries: refetchBoard(),
      })
      setDeclineId(null)
      setReasonDraft('')
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [row.id]: t(`owner.declineError.${declineErrorKey(graphqlErrorCode(error))}`),
      }))
    } finally {
      setBusyId(null)
    }
  }

  async function onDismiss(row: PendingBooking) {
    if (salon === null) {
      return
    }
    setBusyId(row.id)
    setErrors((current) => {
      const next = { ...current }
      delete next[row.id]
      return next
    })
    try {
      await dismissReschedule({
        variables: { bookingId: row.id },
        refetchQueries: refetchBoard(),
      })
      setDismissId(null)
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [row.id]: t(`owner.acceptError.${acceptErrorKey(graphqlErrorCode(error))}`),
      }))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <OwnerPageSkeleton>
        <OwnerWeekSkeleton />
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
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.title')}</h1>
          <p className="mt-8 text-sm text-body">{t('owner.notOwner')}</p>
          <Link
            to={CREATE_SALON_PATH}
            className="mt-4 inline-block text-sm font-semibold text-ink"
          >
            {t('owner.createSalon')}
          </Link>
        </main>
      </>
    )
  }

  const rows = queue?.pendingBookings ?? []
  const workers = board?.salon?.workers ?? []
  const hours = board?.salon?.hours ?? null
  function closedFor(ymd: string): boolean {
    if (hours === null) {
      return false
    }
    const day = hoursForDate(hours, ymd)
    return day === undefined || day.closed
  }
  const badge = chatBadgeCount(chatCount?.inFlightIntakeCount ?? 0)
  const firstOwnedId = salons[0]?.id ?? salon.id
  const rangeRows = occupyingRange?.occupyingBookingsRange ?? []
  const groups = kanbanGroups((dayBookings?.salonDayBookings ?? []).filter((row) => row.status !== 'REQUESTED'))
  const dayTitle = `${t(`weekday.${sarajevoWeekday(date)}`)}, ${formatPickerDayNumeric(date)}`

  const pendingList = (
    <ul className="space-y-3">
      {rows.map((row) => (
        <QueueRow
          key={row.id}
          row={row}
          busy={busyId === row.id}
          error={errors[row.id]}
          declineOpen={declineId === row.id}
          dismissOpen={dismissId === row.id}
          reasonDraft={reasonDraft}
          onAccept={() => void onAccept(row)}
          onDeclineOpen={() => {
            setDeclineId(row.id)
            setReasonDraft('')
            setErrors((current) => {
              const next = { ...current }
              delete next[row.id]
              return next
            })
          }}
          onDeclineCancel={() => {
            setDeclineId(null)
            setReasonDraft('')
          }}
          onDeclineConfirm={() => void onDecline(row)}
          onDismissOpen={() => {
            setDismissId(row.id)
            setErrors((current) => {
              const next = { ...current }
              delete next[row.id]
              return next
            })
          }}
          onDismissCancel={() => setDismissId(null)}
          onDismissConfirm={() => void onDismiss(row)}
          onReasonChange={setReasonDraft}
        />
      ))}
    </ul>
  )

  return (
    <>
      <OwnerShell
        personName={data.me.name}
        title={t('owner.title')}
        salons={salons}
        salonId={salon.id}
        firstOwnedId={firstOwnedId}
        date={date}
        badge={badge}
        active="queue"
        hideSwitcher={hideSwitcher}
        onSalon={onSalon}
        action={
          <>
            {jump !== undefined && jump.count > 0 ? (
              <button
                type="button"
                onClick={() => {
                  const landed = nextPendingDay(date, jump.dates)
                  if (landed !== null) {
                    onDate(landed)
                  }
                }}
                className="inline-flex h-11 items-center rounded-full bg-pastel-pink px-6 text-sm font-semibold text-ink active:scale-[0.98]"
              >
                {t('owner.pendingJump', { count: jump.count })}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setPhoneOpen(true)}
              className="inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-canvas active:scale-[0.98] active:bg-[#242424]"
            >
              {t('owner.phone.button')}
            </button>
          </>
        }
      >
        {kanban ? (
          <section className="rounded-3xl bg-canvas p-4 md:p-6">
            <WeekHeader days={days} onShift={(delta) => onDate(shiftOwnerDate(date, delta))} />
            <DayChips days={days} date={date} closedFor={closedFor} onDate={onDate} className="mt-4" />
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{dayTitle}</h3>
            {closedFor(date) ? <p className="mt-1 text-sm text-muted">{t('owner.closedDay')}</p> : null}
            <KanbanBoard>
              <BoardColumn column="pending" count={rows.length}>
                {queueLoading ? <ColumnSkeleton /> : pendingList}
              </BoardColumn>
              {(['proposed', 'confirmed', 'done'] as const).map((column) => (
                <BoardColumn key={column} column={column} count={groups[column].length}>
                  {dayBookings === undefined ? (
                    <ColumnSkeleton />
                  ) : (
                    groups[column].map((row) => {
                      const ymd = row.status === 'CONFIRMED' ? occupyingSarajevoYmd(row) : null
                      return (
                        <BookingCard
                          key={row.id}
                          row={row}
                          to={`/owner/requests/${row.id}`}
                          progress={ymd !== null ? occupiedElapsedShare(ymd, row.preferredStartsAtLabel, row.durationMinutes, now) : undefined}
                        />
                      )
                    })
                  )}
                </BoardColumn>
              ))}
            </KanbanBoard>
          </section>
        ) : (
          <>
            <section className="rounded-3xl bg-canvas p-4 md:p-6">
              <WeekHeader days={days} onShift={(delta) => onDate(shiftOwnerDate(date, delta))} />
              <DayChips days={days} date={date} closedFor={closedFor} onDate={onDate} className="mt-4 md:hidden" />
              {workers.length === 0 ? <p className="mt-4 text-sm text-body">{t('owner.noWorkers')}</p> : null}
              {occupyingRange === undefined ? (
                <WeekGridSkeleton className="mt-4" />
              ) : (
                <WeekGrid days={days} date={date} rows={rangeRows} closedFor={closedFor} onDate={onDate} now={now} />
              )}
            </section>
            <section className="mt-4 rounded-3xl bg-canvas p-4 md:p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
                {t('owner.pendingFor')} · {dayTitle}
                <span className="rounded-full bg-pastel-pink px-2 py-0.5 text-xs tabular-nums">{rows.length}</span>
              </h3>
              <div className="mt-4">
                {queueLoading ? (
                  <ColumnSkeleton count={3} />
                ) : rows.length === 0 ? (
                  <p className="text-sm text-muted">{t('owner.noPending')}</p>
                ) : (
                  pendingList
                )}
              </div>
            </section>
          </>
        )}
      </OwnerShell>
      <PhoneBookingDialog
        open={phoneOpen}
        salonId={salon.id}
        hours={board?.salon == null ? null : board.salon.hours}
        workers={board?.salon?.workers ?? []}
        categories={board?.salon?.serviceCategories ?? []}
        onClose={() => setPhoneOpen(false)}
        onSaved={(saved) => {
          const savedWeek = ownerWeekDays(saved)
          setPhoneOpen(false)
          if (lockedSearch === undefined) {
            setParams(ownerSearchParams(saved, sarajevoToday(), salon.id, firstOwnedId))
          }
          void refetchQueue({ salonId: salon.id, date: saved, limit: 50 })
          if (kanban) {
            void refetchDay({ salonId: salon.id, date: saved, origin: null })
          } else {
            void refetchRange({ salonId: salon.id, from: savedWeek[0], to: savedWeek[6] })
          }
        }}
      />
    </>
  )
}

function QueueRow({
  row,
  busy,
  error,
  declineOpen,
  dismissOpen,
  reasonDraft,
  onAccept,
  onDeclineOpen,
  onDeclineCancel,
  onDeclineConfirm,
  onDismissOpen,
  onDismissCancel,
  onDismissConfirm,
  onReasonChange,
}: {
  row: PendingBooking
  busy: boolean
  error?: string
  declineOpen: boolean
  dismissOpen: boolean
  reasonDraft: string
  onAccept: () => void
  onDeclineOpen: () => void
  onDeclineCancel: () => void
  onDeclineConfirm: () => void
  onDismissOpen: () => void
  onDismissCancel: () => void
  onDismissConfirm: () => void
  onReasonChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const chrome = overlayQueueChrome(row.reschedulePending)
  const clock = queueRowLabel(row)

  return (
    <li className="min-w-0 rounded-2xl bg-status-pending p-3 md:p-4">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-sm font-semibold text-ink">
          {queueChipInitial(row.customerName)}
        </span>
        <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold tabular-nums text-ink">{clock}</p>
      <p className="font-semibold text-ink">
        {row.customerName}
        {' · '}
        {row.services.map((s) => s.name).join(', ')}
      </p>
      <p className="mt-1 text-sm text-body">
        {t('salon.duration', { n: row.durationMinutes })}
        {' · '}
        {row.worker ? row.worker.name : t('salon.noPreference')}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {chrome.tag ? (
          <span className="rounded-full bg-canvas/70 px-2 py-0.5 text-xs font-semibold text-ink">
            {t('owner.reschedule')}
          </span>
        ) : null}
        {assistantOriginVisible(row.intake) ? (
          <span className="rounded-full bg-canvas/70 px-2 py-0.5 text-xs font-semibold text-ink">
            {t('owner.assistant')}
          </span>
        ) : null}
        {isPreferredSoon(clock) ? (
          <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-canvas">
            {t('owner.soon')}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chrome.acceptReschedule || (chrome.acceptPreferred && canAcceptPreferredTime(row.worker)) ? (
          <button
            type="button"
            disabled={busy}
            onClick={onAccept}
            className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
          >
            {t('owner.accept')}
          </button>
        ) : null}
        {chrome.propose ? (
          <Link
            to={`/owner/requests/${row.id}`}
            state={{ board: `${location.pathname}${location.search}` }}
            className="rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-ink"
          >
            {t('owner.propose')}
          </Link>
        ) : null}
        {chrome.decline && !declineOpen ? (
          <button
            type="button"
            disabled={busy}
            onClick={onDeclineOpen}
            className="rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {t('owner.decline')}
          </button>
        ) : null}
        {chrome.dismiss && !dismissOpen ? (
          <button
            type="button"
            disabled={busy}
            onClick={onDismissOpen}
            className="rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {t('owner.keepOriginal')}
          </button>
        ) : null}
      </div>
      {declineOpen ? (
        <div className="mt-3 space-y-2">
          <label className="block text-sm text-body">
            {t('owner.declineReason')}
            <textarea
              value={reasonDraft}
              maxLength={255}
              disabled={busy}
              onChange={(e) => onReasonChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
              rows={2}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onDeclineConfirm}
              className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
            >
              {t('owner.declineConfirm')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onDeclineCancel}
              className="rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
            >
              {t('owner.declineCancel')}
            </button>
          </div>
        </div>
      ) : null}
      {dismissOpen ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onDismissConfirm}
            className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
          >
            {t('owner.declineConfirm')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDismissCancel}
            className="rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {t('owner.declineCancel')}
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-busy-busy">{error}</p> : null}
        </div>
      </div>
    </li>
  )
}
