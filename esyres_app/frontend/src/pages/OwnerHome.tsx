import { DndContext, PointerSensor, useDraggable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { WorkerPanel } from '../components/WorkerPanel'
import { ME_QUERY, type MeData } from '../graphql/auth'
import {
  ACCEPT_PREFERRED_TIME_MUTATION,
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
import {
  acceptErrorKey,
  canAcceptPreferredTime,
  formatSarajevoTime,
  hoursForDate,
  isPreferredSoon,
  occupyingBlock,
  ownerDateFromSearch,
  panelCells,
  proposeErrorKey,
} from '../lib/owner'

export function OwnerHome() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const date = ownerDateFromSearch(params.get('date'))
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const salon = data?.me?.salons[0] ?? null
  const ownerReady = salon !== null && data?.me?.emailVerified === true
  const { data: queue, loading: queueLoading } = useQuery<PendingBookingsData>(PENDING_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date },
    skip: !ownerReady,
  })
  const { data: board } = useQuery<OwnerSalonData>(OWNER_SALON_QUERY, {
    variables: { id: salon?.id ?? '' },
    skip: !ownerReady,
  })
  const { data: occupying } = useQuery<OccupyingBookingsData>(OCCUPYING_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date },
    skip: !ownerReady,
  })
  const [accept] = useMutation(ACCEPT_PREFERRED_TIME_MUTATION)
  const [propose] = useMutation(PROPOSE_TIME_MUTATION)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function onDate(value: string) {
    const next = ownerDateFromSearch(value)
    if (next === sarajevoToday()) {
      setParams({})
      return
    }
    setParams({ date: next })
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
      await accept({
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

  function onDragEnd(event: DragEndEvent) {
    const over = event.over
    if (over === null || busyId !== null) {
      return
    }
    const bookingId = String(event.active.id)
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
                  onAccept={() => void onAccept(row)}
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
  onAccept,
}: {
  row: PendingBooking
  busy: boolean
  error?: string
  onAccept: () => void
}) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: row.id,
    disabled: busy,
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
      {canAcceptPreferredTime(row.worker) ? (
        <button
          type="button"
          disabled={busy}
          onClick={onAccept}
          className="mt-3 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
        >
          {t('owner.accept')}
        </button>
      ) : null}
      {error ? <p className="mt-2 text-sm text-busy-busy">{error}</p> : null}
    </li>
  )
}
