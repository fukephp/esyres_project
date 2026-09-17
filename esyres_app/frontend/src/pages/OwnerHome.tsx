import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { TopNav } from '../components/TopNav'
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
  OCCUPYING_BOOKINGS_QUERY,
  OCCUPYING_BOOKINGS_RANGE_QUERY,
  OWNER_SALON_QUERY,
  PENDING_BOOKINGS_QUERY,
  type OccupyingBookingsData,
  type OccupyingBookingsRangeData,
  type OccupyingBooking,
  type OwnerSalonData,
  type PendingBooking,
  type PendingBookingsData,
} from '../graphql/pending'
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
  formatOwnerMonthTitle,
  formatSarajevoTime,
  hoursForDate,
  isPreferredSoon,
  mixRestWithBreak,
  occupyingBlock,
  occupyingClockRange,
  occupyingDotsForDay,
  ownerDateFromSearch,
  ownerMonthContains,
  ownerMonthDays,
  ownerMonthFromYmd,
  ownerMonthRange,
  ownerMonthWeekdayOffset,
  ownerSalonFromSearch,
  ownerSearchParams,
  overlayQueueChrome,
  queueChipInitial,
  queueRowClock,
  selectedDayOccupying,
  shiftOwnerMonth,
  sarajevoWeekday,
  trimDeclineReason,
  workerDotColor,
} from '../lib/owner'

export function OwnerHome() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const date = ownerDateFromSearch(params.get('date'))
  const [visible, setVisible] = useState(() => ownerMonthFromYmd(date))
  useEffect(() => {
    if (!ownerMonthContains(visible.year, visible.month, date)) {
      setVisible(ownerMonthFromYmd(date))
    }
  }, [date, visible.month, visible.year])
  const monthSpan = ownerMonthRange(visible.year, visible.month)
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
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
  const { data: board } = useQuery<OwnerSalonData>(OWNER_SALON_QUERY, {
    variables: { id: salon?.id ?? '' },
    skip: !ownerReady,
  })
  const { data: occupying, refetch: refetchOccupying } = useQuery<OccupyingBookingsData>(OCCUPYING_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date },
    skip: !ownerReady,
  })
  const { data: occupyingRange, refetch: refetchRange } = useQuery<OccupyingBookingsRangeData>(OCCUPYING_BOOKINGS_RANGE_QUERY, {
    variables: { salonId: salon?.id ?? '', from: monthSpan.from, to: monthSpan.to },
    skip: !ownerReady,
  })
  function refetchAll() {
    void refetchQueue()
    void refetchOccupying()
    void refetchRange()
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

  function onDate(value: string) {
    setParams(ownerSearchParams(ownerDateFromSearch(value), sarajevoToday(), salonId, salons[0]?.id ?? null))
  }

  function onSalon(id: string) {
    setParams(ownerSearchParams(date, sarajevoToday(), id, salons[0]?.id ?? null))
  }

  function refetchBoard() {
    if (salon === null) {
      return []
    }
    return [
      { query: PENDING_BOOKINGS_QUERY, variables: { salonId: salon.id, date, limit: 50 } },
      { query: OCCUPYING_BOOKINGS_QUERY, variables: { salonId: salon.id, date } },
      { query: OCCUPYING_BOOKINGS_RANGE_QUERY, variables: { salonId: salon.id, from: monthSpan.from, to: monthSpan.to } },
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
  const dayHours = hoursForDate(board?.salon?.hours ?? [], date)
  const closed = dayHours === undefined || dayHours.closed
  const dayOccupying = occupying?.occupyingBookings ?? []
  const { soon, rest } = selectedDayOccupying(dayOccupying)
  const restItems = mixRestWithBreak(rest, dayHours?.breakStartsAt ?? null, dayHours?.breakEndsAt ?? null)
  const hasBreak = dayHours?.breakStartsAt !== null && dayHours?.breakEndsAt !== null
  const emptyOpen = !closed && rows.length === 0 && dayOccupying.filter((row) => occupyingBlock(row) !== null).length === 0 && !hasBreak
  const badge = chatBadgeCount(chatCount?.inFlightIntakeCount ?? 0)
  const firstOwnedId = salons[0]?.id ?? salon.id
  const monthDays = ownerMonthDays(visible.year, visible.month)
  const pad = ownerMonthWeekdayOffset(visible.year, visible.month)
  const rangeRows = occupyingRange?.occupyingBookingsRange ?? []

  const pendingList = (
    <ul className="mt-4 space-y-3">
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
      <TopNav me={navMe} />
      <div className="min-h-svh md:flex">
      <aside className="hidden border-r border-hairline bg-canvas px-5 py-8 text-ink md:flex md:w-56 md:shrink-0 md:flex-col">
        {salons.length > 1 ? (
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
        ) : (
          <p className="text-sm font-semibold">{salon.name}</p>
        )}
        <OwnerNav
          salonId={salon.id}
          firstOwnedId={firstOwnedId}
          date={date}
          badge={badge}
          active="queue"
        />
      </aside>
      <main className="flex-1 px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink md:hidden">{t('owner.title')}</h1>
        {salons.length > 1 ? (
          <label className="mt-1 block max-w-xs text-sm text-body md:hidden">
            {t('owner.salon')}
            <select
              value={salon.id}
              onChange={(e) => onSalon(e.target.value)}
              className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
            >
              {salons.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="mt-1 text-sm text-body md:hidden">{salon.name}</p>
        )}
        <div className="md:hidden">
          <OwnerNav
            salonId={salon.id}
            firstOwnedId={firstOwnedId}
            date={date}
            badge={badge}
            active="queue"
          />
        </div>
        <section className="rounded-lg border border-hairline bg-canvas p-4">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={t('owner.prevMonth')}
                  onClick={() => setVisible(shiftOwnerMonth(visible.year, visible.month, -1))}
                  className="px-1 text-lg text-ink"
                >
                  ‹
                </button>
                <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                  {formatOwnerMonthTitle(visible.year, visible.month)}
                </h2>
                <button
                  type="button"
                  aria-label={t('owner.nextMonth')}
                  onClick={() => setVisible(shiftOwnerMonth(visible.year, visible.month, 1))}
                  className="px-1 text-lg text-ink"
                >
                  ›
                </button>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
                {['weekday.MONDAY', 'weekday.TUESDAY', 'weekday.WEDNESDAY', 'weekday.THURSDAY', 'weekday.FRIDAY', 'weekday.SATURDAY', 'weekday.SUNDAY'].map((key) => (
                  <div key={key}>{t(key)}</div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: pad }, (_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {monthDays.map((ymd) => {
                  const selected = ymd === date
                  const dots = occupyingDotsForDay(rangeRows, ymd)

                  return (
                    <button
                      key={ymd}
                      type="button"
                      onClick={() => onDate(ymd)}
                      className={`flex min-h-10 flex-col items-center rounded-md py-1 text-sm ${selected ? 'bg-ink text-canvas' : 'text-ink'}`}
                    >
                      {Number(ymd.slice(8))}
                      <span className="mt-0.5 flex h-1.5 gap-0.5">
                        {dots.map((dot) => (
                          <span key={dot.workerId} className={`h-1.5 w-1.5 rounded-full ${dot.color}`} />
                        ))}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                {t(`weekday.${sarajevoWeekday(date)}`)}, {formatPickerDayNumeric(date)}
              </h3>
              {queueLoading ? (
                <p className="mt-4 text-sm text-body">{t('salon.loading')}</p>
              ) : rows.length > 2 ? (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-ink">
                    {t('owner.title')} ({rows.length})
                  </summary>
                  {pendingList}
                </details>
              ) : rows.length > 0 ? (
                pendingList
              ) : null}
              {workers.length === 0 ? (
                <p className="mt-4 text-sm text-body">{t('owner.noWorkers')}</p>
              ) : closed ? (
                <p className="mt-4 text-sm text-body">{t('owner.closedDay')}</p>
              ) : (
                <>
                  {soon.length > 0 ? (
                    <h4 className="mt-4 text-sm font-semibold text-ink">{t('owner.soon')}</h4>
                  ) : null}
                  {soon.map((row) => (
                    <OccupyingRow key={row.id} row={row} />
                  ))}
                  {restItems.map((item) =>
                    item.kind === 'break' ? (
                      <p key="break" className="mt-3 text-sm text-muted">
                        {t('owner.break')}
                        {' · '}
                        {item.endsAt}
                      </p>
                    ) : (
                      <OccupyingRow key={item.booking.id} row={item.booking} />
                    ),
                  )}
                  {emptyOpen ? <p className="mt-4 text-sm text-body">{t('owner.empty')}</p> : null}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
    </>
  )
}

function OccupyingRow({ row }: { row: OccupyingBooking }) {
  const { t } = useTranslation()
  const block = occupyingBlock(row)
  if (block === null) {
    return null
  }
  const workerName = row.status === 'TIME_PROPOSED' ? row.proposedWorker?.name : row.worker?.name

  return (
    <Link
      to={`/owner/requests/${row.id}`}
      className="mt-3 flex items-start gap-3 border border-hairline px-3 py-2"
    >
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${workerDotColor(block.workerId)}`} />
      <span className="min-w-0">
        <span className="block font-semibold text-ink">{block.label}</span>
        <span className="mt-1 block text-sm text-muted">
          {occupyingClockRange(block.start, block.durationMinutes)}
          {workerName !== undefined && workerName !== '' ? ` · ${workerName}` : ''}
        </span>
        {row.status === 'TIME_PROPOSED' ? (
          <span className="mt-1 inline-block rounded-sm border border-hairline px-2 py-0.5 text-xs font-semibold text-ink">
            {t('bookings.status.TIME_PROPOSED')}
          </span>
        ) : null}
      </span>
    </Link>
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
  const chrome = overlayQueueChrome(row.reschedulePending)
  const clock = queueRowClock(row)

  return (
    <li className="rounded-lg border border-hairline bg-surface-soft px-4 py-3">
      <div className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-sm font-semibold text-ink">
          {queueChipInitial(row.customerName)}
        </span>
        <div className="min-w-0 flex-1">
      <p className="font-semibold text-ink">
        {row.customerName}
        {' · '}
        {row.services.map((s) => s.name).join(', ')}
      </p>
      <p className="mt-1 text-sm text-muted">
        {t('salon.duration', { n: row.durationMinutes })}
        {' · '}
        {formatSarajevoTime(clock)}
        {' · '}
        {row.worker ? row.worker.name : t('salon.noPreference')}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {chrome.tag ? (
          <span className="rounded-sm border border-hairline px-2 py-0.5 text-xs font-semibold text-ink">
            {t('owner.reschedule')}
          </span>
        ) : null}
        {assistantOriginVisible(row.intake) ? (
          <span className="rounded-sm border border-hairline px-2 py-0.5 text-xs font-semibold text-ink">
            {t('owner.assistant')}
          </span>
        ) : null}
        {isPreferredSoon(clock) ? (
          <span className="rounded-sm bg-cell-pending px-2 py-0.5 text-xs font-semibold text-ink">
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
            className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink"
          >
            {t('owner.propose')}
          </Link>
        ) : null}
        {chrome.decline && !declineOpen ? (
          <button
            type="button"
            disabled={busy}
            onClick={onDeclineOpen}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {t('owner.decline')}
          </button>
        ) : null}
        {chrome.dismiss && !dismissOpen ? (
          <button
            type="button"
            disabled={busy}
            onClick={onDismissOpen}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
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
              className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
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
            className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
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
