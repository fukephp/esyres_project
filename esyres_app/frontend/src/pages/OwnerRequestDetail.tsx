import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { ME_QUERY, type MeData } from '../graphql/auth'
import {
  ACCEPT_PREFERRED_TIME_MUTATION,
  DECLINE_BOOKING_MUTATION,
  OCCUPYING_BOOKINGS_QUERY,
  OWNER_BOOKING_QUERY,
  OWNER_SALON_QUERY,
  PROPOSE_TIME_MUTATION,
  type OccupyingBookingsData,
  type OccupyingBooking,
  type OwnerBookingData,
  type OwnerSalonData,
} from '../graphql/pending'
import { graphqlErrorCode } from '../lib/booking'
import {
  acceptErrorKey,
  canAcceptPreferredTime,
  declineErrorKey,
  formatSarajevoTime,
  hoursForDate,
  occupyingBlock,
  ownerQueuePath,
  panelCells,
  proposeErrorKey,
  proposeStartTimes,
  trimDeclineReason,
} from '../lib/owner'

export function OwnerRequestDetail() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const salon = data?.me?.salons[0] ?? null
  const ownerReady = salon !== null && data?.me?.emailVerified === true
  const {
    data: bookingData,
    loading: bookingLoading,
    error: bookingError,
  } = useQuery<OwnerBookingData>(OWNER_BOOKING_QUERY, {
    variables: { id },
    skip: !ownerReady || id === '',
  })
  const booking = bookingData?.ownerBooking
  const salonId = booking?.salon.id ?? ''
  const date = booking?.preferredDate ?? ''
  const { data: board } = useQuery<OwnerSalonData>(OWNER_SALON_QUERY, {
    variables: { id: salonId },
    skip: salonId === '',
  })
  const { data: occupying } = useQuery<OccupyingBookingsData>(OCCUPYING_BOOKINGS_QUERY, {
    variables: { salonId, date },
    skip: salonId === '' || date === '',
  })
  const [accept] = useMutation(ACCEPT_PREFERRED_TIME_MUTATION)
  const [propose] = useMutation(PROPOSE_TIME_MUTATION)
  const [decline] = useMutation(DECLINE_BOOKING_MUTATION)
  const [workerId, setWorkerId] = useState('')
  const [time, setTime] = useState('')
  const [busy, setBusy] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [reasonDraft, setReasonDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (booking === undefined) {
      return
    }
    setWorkerId(booking.worker?.id ?? '')
    setTime('')
    setDeclineOpen(false)
    setReasonDraft('')
    setError(null)
  }, [booking?.id, booking?.worker?.id])

  const workers = board?.salon?.workers ?? []
  const dayHours = hoursForDate(board?.salon?.hours ?? [], date)
  const cells = panelCells(dayHours)
  const blocks = (occupying?.occupyingBookings ?? [])
    .map((row: OccupyingBooking) => occupyingBlock(row))
    .filter((row) => row !== null)
  const times = workerId === '' ? [] : proposeStartTimes(cells, blocks, workerId)
  const queuePath = date === '' ? '/owner' : ownerQueuePath(date)
  const forbidden = graphqlErrorCode(bookingError) === 'FORBIDDEN'
  const bounce = forbidden || (booking !== undefined && booking.status !== 'REQUESTED')

  async function goQueue() {
    if (booking === undefined) {
      return
    }
    await navigate(ownerQueuePath(booking.preferredDate))
  }

  async function onAccept() {
    if (booking === undefined) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await accept({ variables: { bookingId: booking.id } })
      await goQueue()
    } catch (caught) {
      setError(t(`owner.acceptError.${acceptErrorKey(graphqlErrorCode(caught))}`))
    } finally {
      setBusy(false)
    }
  }

  async function onPropose() {
    if (booking === undefined || workerId === '' || time === '') {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await propose({ variables: { bookingId: booking.id, workerId, proposedTime: time } })
      await goQueue()
    } catch (caught) {
      setError(t(`owner.proposeError.${proposeErrorKey(graphqlErrorCode(caught))}`))
    } finally {
      setBusy(false)
    }
  }

  async function onDecline() {
    if (booking === undefined) {
      return
    }
    setBusy(true)
    setError(null)
    const reason = trimDeclineReason(reasonDraft)
    try {
      await decline({ variables: { bookingId: booking.id, reason } })
      await goQueue()
    } catch (caught) {
      setError(t(`owner.declineError.${declineErrorKey(graphqlErrorCode(caught))}`))
    } finally {
      setBusy(false)
    }
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

  if (bookingLoading && booking === undefined && !forbidden) {
    return (
      <main className="px-5 py-8 text-body">
        <p>{t('salon.loading')}</p>
      </main>
    )
  }

  return (
    <div className="min-h-svh md:flex">
      <aside className="hidden bg-surface-dark px-5 py-8 text-on-dark md:flex md:w-56 md:shrink-0 md:flex-col">
        <p className="text-sm font-semibold">{salon.name}</p>
        <p className="mt-6 text-sm font-medium">{t('owner.title')}</p>
      </aside>
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink md:hidden">{t('owner.title')}</h1>
        <p className="mt-1 text-sm text-body md:hidden">{salon.name}</p>
        <p className="mt-6">
          <Link to={queuePath} className="text-sm font-medium text-ink underline">
            {t('owner.back')}
          </Link>
        </p>
        {bounce || booking === undefined ? (
          <p className="mt-8 text-sm text-body">{t('owner.acceptError.NOT_REQUESTED')}</p>
        ) : (
          <>
            <p className="mt-8 font-semibold text-ink">{formatSarajevoTime(booking.preferredStartsAt)}</p>
            <p className="mt-1 text-sm text-ink">{booking.customerName}</p>
            <p className="mt-1 text-sm text-body">
              {booking.preferredDate}
              {' · '}
              {booking.services.map((s) => s.name).join(', ')}
              {' · '}
              {t('salon.duration', { n: booking.durationMinutes })}
              {' · '}
              {booking.worker ? booking.worker.name : t('salon.noPreference')}
            </p>
            {workers.length === 0 ? (
              <p className="mt-8 text-sm text-body">{t('owner.noWorkers')}</p>
            ) : cells.length === 0 ? (
              <p className="mt-8 text-sm text-body">{t('owner.closedDay')}</p>
            ) : (
              <form
                className="mt-8 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  void onPropose()
                }}
              >
                <label className="block text-sm text-body">
                  {t('salon.worker')}
                  <select
                    value={workerId}
                    disabled={busy}
                    onChange={(e) => {
                      setWorkerId(e.target.value)
                      setTime('')
                    }}
                    className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                  >
                    {booking.worker === null ? <option value="">{t('owner.pickWorker')}</option> : null}
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-body">
                  {t('salon.time')}
                  <select
                    value={time}
                    disabled={busy || workerId === ''}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                  >
                    <option value="">{t('salon.time')}</option>
                    {times.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={busy || workerId === '' || time === '' || !times.includes(time)}
                  className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                >
                  {t('owner.propose')}
                </button>
              </form>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {canAcceptPreferredTime(booking.worker) ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onAccept()}
                  className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                >
                  {t('owner.accept')}
                </button>
              ) : null}
              {declineOpen ? null : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setDeclineOpen(true)
                    setReasonDraft('')
                    setError(null)
                  }}
                  className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
                >
                  {t('owner.decline')}
                </button>
              )}
            </div>
            {declineOpen ? (
              <div className="mt-3 space-y-2">
                <label className="block text-sm text-body">
                  {t('owner.declineReason')}
                  <textarea
                    value={reasonDraft}
                    maxLength={255}
                    disabled={busy}
                    onChange={(e) => setReasonDraft(e.target.value)}
                    className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                    rows={2}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onDecline()}
                    className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                  >
                    {t('owner.declineConfirm')}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setDeclineOpen(false)
                      setReasonDraft('')
                    }}
                    className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
                  >
                    {t('owner.declineCancel')}
                  </button>
                </div>
              </div>
            ) : null}
            {error ? <p className="mt-2 text-sm text-busy-busy">{error}</p> : null}
          </>
        )}
      </main>
    </div>
  )
}
