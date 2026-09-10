import { DndContext, PointerSensor, useDraggable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { WorkerPanel } from '../components/WorkerPanel'
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
  OWNER_SALON_QUERY,
  PENDING_BOOKINGS_QUERY,
  PROPOSE_TIME_MUTATION,
  type OccupyingBookingsData,
  type OccupyingBooking,
  type OwnerSalonData,
  type PendingBooking,
  type PendingBookingsData,
} from '../graphql/pending'
import { graphqlErrorCode } from '../lib/booking'
import { sarajevoToday } from '../lib/format'
import { chatBadgeCount } from '../lib/intake'
import { useOwnerPush } from '../lib/push'
import {
  acceptErrorKey,
  assistantOriginVisible,
  canAcceptPreferredTime,
  declineErrorKey,
  formatSarajevoTime,
  hoursForDate,
  isPreferredSoon,
  occupyingBlock,
  overlayQueueChrome,
  ownerDateFromSearch,
  ownerSalonFromSearch,
  ownerSearchParams,
  panelCells,
  proposeErrorKey,
  queueRowClock,
  trimDeclineReason,
} from '../lib/owner'

export function OwnerHome() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const date = ownerDateFromSearch(params.get('date'))
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const salons = data?.me?.salons ?? []
  const salonId = ownerSalonFromSearch(params.get('salon'), salons)
  const salon = salons.find((row) => row.id === salonId) ?? null
  const ownerReady = salon !== null && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const { data: queue, loading: queueLoading, refetch: refetchQueue } = useQuery<PendingBookingsData>(PENDING_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date },
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
  useSubscription(BOOKING_CUSTOMER_RESPONDED_SUBSCRIPTION, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    onData: () => {
      void refetchQueue()
      void refetchOccupying()
    },
  })
  useSubscription(BOOKING_RESCHEDULED_SUBSCRIPTION, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    onData: () => {
      void refetchQueue()
      void refetchOccupying()
    },
  })
  useSubscription(BOOKING_CANCELLED_SUBSCRIPTION, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    onData: () => {
      void refetchQueue()
      void refetchOccupying()
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
  const [propose] = useMutation(PROPOSE_TIME_MUTATION)
  const [decline] = useMutation(DECLINE_BOOKING_MUTATION)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [declineId, setDeclineId] = useState<string | null>(null)
  const [dismissId, setDismissId] = useState<string | null>(null)
  const [reasonDraft, setReasonDraft] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

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
      { query: PENDING_BOOKINGS_QUERY, variables: { salonId: salon.id, date } },
      { query: OCCUPYING_BOOKINGS_QUERY, variables: { salonId: salon.id, date } },
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

  async function onPropose(bookingId: string, workerId: string, proposedTime: string) {
    setBusyId(bookingId)
    setErrors((current) => {
      const next = { ...current }
      delete next[bookingId]
      return next
    })
    try {
      await propose({
        variables: { bookingId, workerId, proposedTime },
        refetchQueries: refetchBoard(),
      })
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [bookingId]: t(`owner.proposeError.${proposeErrorKey(graphqlErrorCode(error))}`),
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

  function onDragEnd(event: DragEndEvent) {
    const over = event.over
    if (over === null || busyId !== null) {
      return
    }
    const bookingId = String(event.active.id)
    const dragged = (queue?.pendingBookings ?? []).find((row) => row.id === bookingId)
    if (dragged?.reschedulePending === true) {
      return
    }
    const data = over.data.current
    if (data === undefined || typeof data.workerId !== 'string' || typeof data.time !== 'string') {
      return
    }
    void onPropose(bookingId, data.workerId, data.time)
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
  const dayHours = hoursForDate(board?.salon?.hours ?? [], date)
  const cells = panelCells(dayHours)
  const blocks = (occupying?.occupyingBookings ?? [])
    .map((row: OccupyingBooking) => occupyingBlock(row))
    .filter((row) => row !== null)
  const badge = chatBadgeCount(chatCount?.inFlightIntakeCount ?? 0)
  const firstOwnedId = salons[0]?.id ?? salon.id

  return (
    <div className="min-h-svh md:flex">
      <aside className="hidden bg-surface-dark px-5 py-8 text-on-dark md:flex md:w-56 md:shrink-0 md:flex-col">
        {salons.length > 1 ? (
          <label className="block text-sm">
            {t('owner.salon')}
            <select
              value={salon.id}
              onChange={(e) => onSalon(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/20 bg-surface-dark px-2 py-1.5 text-sm text-on-dark"
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
          tone="dark"
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
            tone="light"
          />
        </div>
        <label className="mt-6 block max-w-xs text-sm text-body">
          {t('owner.date')}
          <input
            type="date"
            value={date}
            onChange={(e) => onDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
          />
        </label>
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          {queueLoading ? (
            <p className="mt-8 text-sm text-body">{t('salon.loading')}</p>
          ) : rows.length === 0 ? (
            <p className="mt-8 text-sm text-body">{t('owner.empty')}</p>
          ) : (
            <ul className="mt-8 max-w-xl space-y-3">
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
          )}
          <WorkerPanel
            workers={board?.salon?.workers ?? []}
            hours={dayHours}
            cells={cells}
            blocks={blocks}
            disabled={busyId !== null}
          />
        </DndContext>
      </main>
    </div>
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: row.id,
    disabled: busy || declineOpen || dismissOpen || !chrome.draggable,
  })
  const style = transform === null ? undefined : { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-hairline bg-canvas px-4 py-3 ${isDragging ? 'opacity-60' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold text-ink">{formatSarajevoTime(clock)}</p>
        <div className="flex flex-wrap items-center justify-end gap-2">
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
      </div>
      <p className="mt-1 text-sm text-ink">{row.customerName}</p>
      <p className="mt-1 text-sm text-body">
        {row.services.map((s) => s.name).join(', ')}
        {' · '}
        {t('salon.duration', { n: row.durationMinutes })}
        {' · '}
        {row.worker ? row.worker.name : t('salon.noPreference')}
      </p>
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
            onPointerDown={(e) => e.stopPropagation()}
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
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
              rows={2}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onDeclineConfirm}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
            >
              {t('owner.declineConfirm')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onDeclineCancel}
              onPointerDown={(e) => e.stopPropagation()}
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
            onPointerDown={(e) => e.stopPropagation()}
            className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
          >
            {t('owner.declineConfirm')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDismissCancel}
            onPointerDown={(e) => e.stopPropagation()}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {t('owner.declineCancel')}
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-busy-busy">{error}</p> : null}
    </li>
  )
}
