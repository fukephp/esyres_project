import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { PhoneBookingDialog } from './OwnerPhoneBooking'
import { openRequestFromState, RequestDetailAside, type RequestAsideState } from './OwnerRequestDetail'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerShell } from '../components/OwnerShell'
import { TopNav } from '../components/TopNav'
import { Alert, Spinner } from '../components/ui'
import { ColumnSkeleton, OwnerPageSkeleton, OwnerWeekSkeleton, WeekGridSkeleton } from '../components/Skeleton'
import { ME_QUERY, UPDATE_KANBAN_COLUMNS_MUTATION, type MeData } from '../graphql/auth'
import {
  IN_FLIGHT_INTAKE_COUNT_QUERY,
  type InFlightIntakeCountData,
} from '../graphql/intake'
import {
  ACCEPT_PREFERRED_TIME_MUTATION,
  ACCEPT_RESCHEDULE_MUTATION,
  ASSIGN_WORKER_MUTATION,
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
  UNANSWERED_BOOKINGS_QUERY,
  type OccupyingBookingsRangeData,
  type OwnerSalonData,
  type PendingBooking,
  type PendingBookingsData,
  type PendingJumpData,
  type SalonDayBookingsData,
  type UnansweredBookingsData,
} from '../graphql/pending'
import { BoardColumn, BookingCard, DayChips, KanbanBoard, KanbanColumnToggles, WeekGrid, WeekHeader } from '../components/OwnerBoards'
import { expiresToday, graphqlErrorCode, isUnansweredBooking } from '../lib/booking'
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
  freeWorkers,
  hoursForDate,
  isPreferredSoon,
  kanbanGroups,
  occupiedElapsedShare,
  occupyingBlock,
  occupyingSarajevoYmd,
  nextPendingDay,
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
  visibleKanbanColumns,
} from '../lib/owner'

export function OwnerHome() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [aside, setAside] = useState<RequestAsideState>(null)
  const asideOpen = aside?.open === true
  useEffect(() => {
    const id = openRequestFromState(location.state)
    if (id === null) {
      return
    }
    setAside({ id, open: true })
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location.state])
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  const [params, setParams] = useSearchParams()
  const date = ownerDateFromSearch(params.get('date'))
  const days = ownerWeekDays(date)
  const week = { from: days[0], to: days[6] }
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const kanban = data?.me?.ownerView === 'KANBAN'
  const navMe = loading ? null : (data?.me ?? null)
  const salons = data?.me?.salons ?? []
  const salonId = ownerSalonFromSearch(params.get('salon'), salons)
  const salon = salons.find((row) => row.id === salonId) ?? null
  const ownerReady = salon !== null && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const { data: queue, loading: queueLoading, refetch: refetchQueue } = useQuery<PendingBookingsData>(PENDING_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date, limit: 50 },
    skip: !ownerReady,
  })
  const { data: unansweredData, refetch: refetchUnanswered } = useQuery<UnansweredBookingsData>(UNANSWERED_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date },
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
    void refetchUnanswered()
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
  const [assignWorker] = useMutation(ASSIGN_WORKER_MUTATION)
  const [acceptReschedule] = useMutation(ACCEPT_RESCHEDULE_MUTATION)
  const [dismissReschedule] = useMutation(DISMISS_RESCHEDULE_MUTATION)
  const [decline] = useMutation(DECLINE_BOOKING_MUTATION)
  const [updateKanbanColumns, { loading: savingColumns }] = useMutation(UPDATE_KANBAN_COLUMNS_MUTATION)
  const [columnError, setColumnError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [declineId, setDeclineId] = useState<string | null>(null)
  const [dismissId, setDismissId] = useState<string | null>(null)
  const [reasonDraft, setReasonDraft] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phoneOpen, setPhoneOpen] = useState(false)

  function openAside(id: string) {
    setAside({ id, open: true })
  }

  function onDate(value: string) {
    setParams(ownerSearchParams(ownerDateFromSearch(value), sarajevoToday(), salonId, salons[0]?.id ?? null))
  }

  function onSalon(id: string) {
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

  async function onAssign(row: PendingBooking, workerId: string) {
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
      await assignWorker({
        variables: { bookingId: row.id, workerId },
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
      <div className="flex min-h-svh flex-col bg-page">
        <TopNav me={navMe} />
        <AuthShell place="panel" onAuthenticated={() => refetch()} />
      </div>
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
    return null
  }

  const rows = (queue?.pendingBookings ?? []).filter((row) => !isUnansweredBooking(row, now))
  const unanswered = unansweredData?.unansweredBookings ?? []
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
  const occupyingRows = kanban ? (dayBookings?.salonDayBookings ?? []) : rangeRows.filter((row) => occupyingSarajevoYmd(row) === date)
  const occupyingReady = kanban ? dayBookings !== undefined : occupyingRange !== undefined
  const freeBlocks = occupyingRows.flatMap((row) => {
    const block = occupyingBlock(row)
    return block === null ? [] : [block]
  })
  const groups = kanbanGroups(
    (dayBookings?.salonDayBookings ?? []).filter((row) => row.status !== 'REQUESTED' || isUnansweredBooking(row, now)),
    now,
  )
  const showInProgress = data?.me?.showInProgress !== false
  const showFinished = data?.me?.showFinished !== false
  const columns = visibleKanbanColumns(showInProgress, showFinished)
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
          taps={
            occupyingReady && row.worker === null
              ? freeWorkers(workers, row.preferredStartsAtLabel, row.durationMinutes, freeBlocks)
              : []
          }
          onAssign={(workerId) => void onAssign(row, workerId)}
          onPropose={() => openAside(row.id)}
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
        hideSwitcher={asideOpen}
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
            <KanbanColumnToggles
              showInProgress={showInProgress}
              showFinished={showFinished}
              error={columnError}
              busy={savingColumns}
              onChange={(nextInProgress, nextFinished) => {
                void updateKanbanColumns({ variables: { showInProgress: nextInProgress, showFinished: nextFinished } })
                  .then(() => setColumnError(null))
                  .catch(() => setColumnError(t('owner.columnsError')))
              }}
            />
            <KanbanBoard>
              {columns.map((column) =>
                column === 'pending' ? (
                  <BoardColumn key={column} column={column} count={rows.length}>
                    {queueLoading ? <ColumnSkeleton /> : pendingList}
                  </BoardColumn>
                ) : (
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
                            onOpen={openAside}
                            now={now}
                            progress={ymd !== null && row.preferredStartsAtLabel !== null ? occupiedElapsedShare(ymd, row.preferredStartsAtLabel, row.durationMinutes, now) : undefined}
                          />
                        )
                      })
                    )}
                  </BoardColumn>
                ),
              )}
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
                <WeekGrid days={days} date={date} rows={rangeRows} closedFor={closedFor} onDate={onDate} now={now} onOpen={openAside} />
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
                {unanswered.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {unanswered.map((row) => (
                      <li key={row.id}>
                        <BookingCard row={row} onOpen={openAside} now={now} />
                      </li>
                    ))}
                  </ul>
                ) : null}
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
          setParams(ownerSearchParams(saved, sarajevoToday(), salon.id, firstOwnedId))
          void refetchQueue({ salonId: salon.id, date: saved, limit: 50 })
          void refetchUnanswered({ salonId: salon.id, date: saved })
          if (kanban) {
            void refetchDay({ salonId: salon.id, date: saved, origin: null })
          } else {
            void refetchRange({ salonId: salon.id, from: savedWeek[0], to: savedWeek[6] })
          }
        }}
      />
      <RequestDetailAside
        aside={aside}
        onClose={() => setAside((current) => (current === null ? null : { ...current, open: false }))}
        onChanged={refetchAll}
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
  taps,
  onAssign,
  onPropose,
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
  taps: { id: string; name: string }[]
  onAssign: (workerId: string) => void
  onPropose: () => void
  onDeclineOpen: () => void
  onDeclineCancel: () => void
  onDeclineConfirm: () => void
  onDismissOpen: () => void
  onDismissCancel: () => void
  onDismissConfirm: () => void
  onReasonChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const chrome = overlayQueueChrome(row.reschedulePending)
  const clock = queueRowLabel(row)

  return (
    <li className="min-w-0 rounded-2xl bg-status-pending p-3 md:p-4">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-sm font-semibold text-ink">
          {queueChipInitial(row.customerName)}
        </span>
        <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold tabular-nums text-ink">{clock || t('owner.noTime')}</p>
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
        {expiresToday(row, new Date()) ? (
          <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-canvas">
            {t('owner.expiresToday')}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chrome.acceptReschedule || (chrome.acceptPreferred && canAcceptPreferredTime(row.worker)) ? (
          <button
            type="button"
            disabled={busy}
            onClick={onAccept}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
          >
            {busy && !declineOpen && !dismissOpen && taps.length === 0 ? <Spinner /> : null}
            {t('owner.accept')}
          </button>
        ) : null}
        {taps.map((worker) => (
          <button
            key={worker.id}
            type="button"
            disabled={busy}
            onClick={() => onAssign(worker.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {busy && !declineOpen && !dismissOpen ? <Spinner /> : null}
            {worker.name}
          </button>
        ))}
        {chrome.propose ? (
          <button
            type="button"
            onClick={onPropose}
            className="rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-ink"
          >
            {t('owner.propose')}
          </button>
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
              className="field mt-1"
              rows={2}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onDeclineConfirm}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
            >
              {busy ? <Spinner /> : null}
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
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
          >
            {busy ? <Spinner /> : null}
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
      {error ? <Alert variant="error" className="mt-2">{error}</Alert> : null}
        </div>
      </div>
    </li>
  )
}
