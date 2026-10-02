import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { TopNav } from '../components/TopNav'
import { OwnerPageSkeleton, RequestDetailSkeleton } from '../components/Skeleton'
import { Alert, CloseButton, Spinner } from '../components/ui'
import { ME_QUERY, type MeData } from '../graphql/auth'
import {
  ACCEPT_PREFERRED_TIME_MUTATION,
  ASSIGN_WORKER_MUTATION,
  DECLINE_BOOKING_MUTATION,
  MARK_NO_SHOW_MUTATION,
  CANCEL_PHONE_BOOKING_MUTATION,
  OCCUPYING_BOOKINGS_QUERY,
  OWNER_BOOKING_QUERY,
  OWNER_SALON_QUERY,
  PROPOSE_TIME_MUTATION,
  type OccupyingBookingsData,
  type OccupyingBooking,
  type OwnerBooking,
  type OwnerBookingData,
  type OwnerSalonData,
} from '../graphql/pending'
import { graphqlErrorCode } from '../lib/booking'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { formatCivilDate, sarajevoToday } from '../lib/format'
import { SALON_PICKER_DIALOG_CLASS } from '../lib/salonSend'
import {
  acceptErrorKey,
  assistantOriginVisible,
  assistantTranscriptLines,
  canAcceptPreferredTime,
  declineErrorKey,
  freeWorkers,
  hoursForDate,
  occupyingBlock,
  ownerDetailMode,
  occupyingClockRange,
  ownerQueuePath,
  panelCells,
  phoneErrorKey,
  proposeErrorKey,
  proposeStartTimes,
  trimDeclineReason,
} from '../lib/owner'
import { useOwnerPush } from '../lib/push'
import { OwnerHome } from './OwnerHome'
import { OwnerZapisi } from './OwnerZapisi'

export function OwnerRequestDetail() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const navMe = loading ? null : (data?.me ?? null)
  const ownerReady = (data?.me?.salons.length ?? 0) > 0 && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const {
    data: bookingData,
    loading: bookingLoading,
    error: bookingError,
    refetch: refetchBooking,
  } = useQuery<OwnerBookingData>(OWNER_BOOKING_QUERY, {
    variables: { id },
    skip: !ownerReady || id === '',
  })
  const booking = bookingData?.ownerBooking
  const firstOwnedId = data?.me?.salons[0]?.id ?? ''
  const salonId = booking?.salon.id ?? ''
  const date = booking?.preferredDate ?? ''
  const { data: salonBoard } = useQuery<OwnerSalonData>(OWNER_SALON_QUERY, {
    variables: { id: salonId },
    skip: salonId === '',
  })
  const { data: occupying } = useQuery<OccupyingBookingsData>(OCCUPYING_BOOKINGS_QUERY, {
    variables: { salonId, date },
    skip: salonId === '' || date === '',
  })
  const [accept] = useMutation(ACCEPT_PREFERRED_TIME_MUTATION)
  const [assignWorker] = useMutation(ASSIGN_WORKER_MUTATION)
  const [propose] = useMutation(PROPOSE_TIME_MUTATION)
  const [decline] = useMutation(DECLINE_BOOKING_MUTATION)
  const [markNoShow] = useMutation(MARK_NO_SHOW_MUTATION)
  const [cancelPhone] = useMutation(CANCEL_PHONE_BOOKING_MUTATION)
  const [workerId, setWorkerId] = useState('')
  const [time, setTime] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const working = busy !== null
  const [declineOpen, setDeclineOpen] = useState(false)
  const [reasonDraft, setReasonDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [noShowError, setNoShowError] = useState<string | null>(null)
  const [phoneCancelOpen, setPhoneCancelOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog !== null && !dialog.open) {
      dialog.showModal()
    }
  })

  useEffect(() => {
    if (booking === undefined) {
      return
    }
    setWorkerId(booking.worker?.id ?? '')
    setTime('')
    setDeclineOpen(false)
    setReasonDraft('')
    setError(null)
    setNoShowError(null)
  }, [booking?.id, booking?.worker?.id])

  const workers = salonBoard?.salon?.workers ?? []
  const dayHours = date === '' ? undefined : hoursForDate(salonBoard?.salon?.hours ?? [], date)
  const cells = panelCells(dayHours)
  const blocks = (occupying?.occupyingBookings ?? [])
    .map((row: OccupyingBooking) => occupyingBlock(row))
    .filter((row) => row !== null)
  const times = workerId === '' ? [] : proposeStartTimes(cells, blocks, workerId)
  const assignTaps =
    booking === undefined || booking.worker !== null || occupying === undefined
      ? []
      : freeWorkers(workers, booking.preferredStartsAtLabel, booking.durationMinutes, blocks)
  const queuePath =
    booking === undefined
      ? '/owner'
      : ownerQueuePath(booking.preferredDate, sarajevoToday(), booking.salon.id, firstOwnedId)
  const board = typeof location.state === 'object' && location.state !== null && 'board' in location.state && typeof location.state.board === 'string'
    ? location.state.board
    : null
  const forbidden = graphqlErrorCode(bookingError) === 'FORBIDDEN'

  function close() {
    if (board !== null) {
      navigate(board)
      return
    }
    navigate(queuePath)
  }

  async function onAccept() {
    if (booking === undefined) {
      return
    }
    setBusy('accept')
    setError(null)
    try {
      await accept({ variables: { bookingId: booking.id } })
      await refetchBooking()
    } catch (caught) {
      setError(t(`owner.acceptError.${acceptErrorKey(graphqlErrorCode(caught))}`))
    } finally {
      setBusy(null)
    }
  }

  async function onAssign(workerIdToAssign: string) {
    if (booking === undefined) {
      return
    }
    setBusy(`assign:${workerIdToAssign}`)
    setError(null)
    try {
      await assignWorker({ variables: { bookingId: booking.id, workerId: workerIdToAssign } })
      await refetchBooking()
    } catch (caught) {
      setError(t(`owner.acceptError.${acceptErrorKey(graphqlErrorCode(caught))}`))
    } finally {
      setBusy(null)
    }
  }

  async function onPropose() {
    if (booking === undefined || workerId === '' || time === '') {
      return
    }
    setBusy('propose')
    setError(null)
    try {
      await propose({ variables: { bookingId: booking.id, workerId, proposedTime: time } })
      await refetchBooking()
    } catch (caught) {
      setError(t(`owner.proposeError.${proposeErrorKey(graphqlErrorCode(caught))}`))
    } finally {
      setBusy(null)
    }
  }

  async function onDecline() {
    if (booking === undefined) {
      return
    }
    setBusy('decline')
    setError(null)
    const reason = trimDeclineReason(reasonDraft)
    try {
      await decline({ variables: { bookingId: booking.id, reason } })
      await refetchBooking()
    } catch (caught) {
      setError(t(`owner.declineError.${declineErrorKey(graphqlErrorCode(caught))}`))
    } finally {
      setBusy(null)
    }
  }

  async function onNoShow() {
    if (booking === undefined) {
      return
    }
    setBusy('noShow')
    setNoShowError(null)
    try {
      await markNoShow({ variables: { bookingId: booking.id } })
      await refetchBooking()
    } catch {
      setNoShowError(t('owner.noShowError'))
    } finally {
      setBusy(null)
    }
  }

  async function onPhoneCancel() {
    if (booking === undefined) {
      return
    }
    setBusy('phoneCancel')
    setError(null)
    try {
      await cancelPhone({ variables: { bookingId: booking.id } })
      navigate(queuePath)
    } catch (err) {
      setError(t(`owner.phone.error.${phoneErrorKey(graphqlErrorCode(err))}`))
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <OwnerPageSkeleton>
        <RequestDetailSkeleton />
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

  if (data.me.salons.length === 0) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="mx-auto max-w-md px-5 py-8">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.title')}</h1>
          <p className="mt-8 text-sm text-body">{t('owner.notOwner')}</p>
        </main>
      </>
    )
  }

  if (bookingLoading && booking === undefined && !forbidden) {
    return (
      <OwnerPageSkeleton>
        <RequestDetailSkeleton />
      </OwnerPageSkeleton>
    )
  }

  const zapisi = board?.startsWith('/owner/zapisi') === true
  const lockedSearch = board ?? (booking !== undefined ? `?date=${booking.preferredDate}&salon=${booking.salon.id}` : '')

  return (
    <>
      <div inert>
        {zapisi ? (
          <OwnerZapisi lockedSearch={board ?? ''} hideSwitcher />
        ) : (
          <OwnerHome lockedSearch={lockedSearch} hideSwitcher />
        )}
      </div>
      <dialog
        ref={dialogRef}
        className={SALON_PICKER_DIALOG_CLASS}
        onCancel={() => {
          close()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            close()
          }
        }}
      >
        <div className="mb-4 flex justify-end">
          <CloseButton onClick={close} />
        </div>
        <section className="rounded-3xl bg-canvas p-4 md:p-6">
        {forbidden || booking === undefined ? (
          <p className="text-sm text-body">{t('owner.acceptError.NOT_REQUESTED')}</p>
        ) : ownerDetailMode(booking.status) === 'bounce' ? (
          <>
            <p className="font-semibold text-ink">{booking.customerName}</p>
            <p className="mt-1 text-sm text-ink">{booking.preferredStartsAtLabel ?? t('owner.noTime')}</p>
            <p className="mt-1 text-sm text-body">
              {formatCivilDate(booking.preferredDate)}
              {' · '}
              {booking.services.map((s) => s.name).join(', ')}
              {' · '}
              {t('salon.duration', { n: booking.durationMinutes })}
              {' · '}
              {booking.worker ? booking.worker.name : t('salon.noPreference')}
            </p>
            <p className="mt-4 text-sm text-body">{t('owner.acceptError.NOT_REQUESTED')}</p>
          </>
        ) : ownerDetailMode(booking.status) === 'read' ? (
          <>
            <p className="font-semibold text-ink">{booking.customerName}</p>
            <p className="mt-1 text-sm text-ink">
              {occupyingBlock(booking) === null
                ? booking.status === 'TIME_PROPOSED' && booking.proposedStartsAtLabel !== null
                  ? booking.proposedStartsAtLabel
                  : (booking.preferredStartsAtLabel ?? t('owner.noTime'))
                : occupyingClockRange(
                    occupyingBlock(booking)!.start,
                    occupyingBlock(booking)!.durationMinutes,
                  )}
            </p>
            <p className="mt-1 text-sm text-body">
              {formatCivilDate(booking.preferredDate)}
              {' · '}
              {booking.services.map((s) => s.name).join(', ')}
              {' · '}
              {t('salon.duration', { n: booking.durationMinutes })}
              {' · '}
              {(booking.status === 'TIME_PROPOSED' ? booking.proposedWorker : booking.worker)
                ? (booking.status === 'TIME_PROPOSED' ? booking.proposedWorker : booking.worker)?.name
                : t('salon.noPreference')}
            </p>
            {booking.origin === 'PHONE' && booking.callerPhone ? (
              <p className="mt-1 text-sm text-body">{booking.callerPhone}</p>
            ) : null}
            {booking.origin === 'PHONE' && booking.callerNote ? (
              <p className="mt-1 text-sm text-body">{booking.callerNote}</p>
            ) : null}
            <PhoneCancel
              booking={booking}
              busy={busy}
              open={phoneCancelOpen}
              onOpen={() => setPhoneCancelOpen(true)}
              onClose={() => setPhoneCancelOpen(false)}
              onConfirm={() => void onPhoneCancel()}
            />
            <PriorMemory booking={booking} busy={busy} error={noShowError} onMark={() => void onNoShow()} />
            {booking.status === 'TIME_PROPOSED' ? (
              <span className="mt-4 inline-block rounded-sm border border-hairline px-2 py-0.5 text-xs font-semibold text-ink">
                {t('bookings.status.TIME_PROPOSED')}
              </span>
            ) : null}
          </>
        ) : ownerDetailMode(booking.status) === 'form' ? (
          <>
            <p className="font-semibold text-ink">{booking.customerName}</p>
            <p className="mt-1 text-sm text-ink">{booking.preferredStartsAtLabel ?? t('owner.noTime')}</p>
            <p className="mt-1 text-sm text-body">
              {formatCivilDate(booking.preferredDate)}
              {' · '}
              {booking.services.map((s) => s.name).join(', ')}
              {' · '}
              {t('salon.duration', { n: booking.durationMinutes })}
              {' · '}
              {booking.worker ? booking.worker.name : t('salon.noPreference')}
            </p>
            <PriorMemory booking={booking} busy={busy} error={noShowError} onMark={() => void onNoShow()} />
            {assistantOriginVisible(booking.intake) ? (
              <>
                <span className="mt-4 inline-block rounded-sm border border-hairline px-2 py-0.5 text-xs font-semibold text-ink">
                  {t('owner.assistant')}
                </span>
                <details className="mt-2 text-sm text-body">
                <summary className="cursor-pointer font-medium text-ink">{t('owner.transcript')}</summary>
                <ul className="mt-2 space-y-1">
                  {assistantTranscriptLines({
                    services: booking.services,
                    workerName: booking.worker?.name ?? null,
                    preferredDate: booking.intake?.preferredDate ?? booking.preferredDate,
                    preferredTime: booking.intake?.preferredTime ?? booking.preferredStartsAtLabel ?? '',
                    noPreference: t('salon.noPreference'),
                  }).map((line) => (
                    <li key={line.step}>
                      {t(`owner.chatStep.${line.step}`)}
                      {': '}
                      {line.value}
                    </li>
                  ))}
                </ul>
              </details>
              </>
            ) : null}
            {assignTaps.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {assignTaps.map((worker) => (
                  <button
                    key={worker.id}
                    type="button"
                    disabled={working}
                    onClick={() => void onAssign(worker.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
                  >
                    {busy === `assign:${worker.id}` ? <Spinner /> : null}
                    {worker.name}
                  </button>
                ))}
              </div>
            ) : null}
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
                    disabled={working}
                    onChange={(e) => {
                      setWorkerId(e.target.value)
                      setTime('')
                    }}
                    className="field mt-1"
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
                    disabled={working || workerId === ''}
                    onChange={(e) => setTime(e.target.value)}
                    className="field mt-1"
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
                  disabled={working || workerId === '' || time === '' || !times.includes(time)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                >
                  {busy === 'propose' ? <Spinner /> : null}
                  {t('owner.propose')}
                </button>
              </form>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {canAcceptPreferredTime(booking.worker) ? (
                <button
                  type="button"
                  disabled={working}
                  onClick={() => void onAccept()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                >
                  {busy === 'accept' ? <Spinner /> : null}
                  {t('owner.accept')}
                </button>
              ) : null}
              {declineOpen ? null : (
                <button
                  type="button"
                  disabled={working}
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
                    disabled={working}
                    onChange={(e) => setReasonDraft(e.target.value)}
                    className="field mt-1"
                    rows={2}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => void onDecline()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                  >
                    {busy === 'decline' ? <Spinner /> : null}
                    {t('owner.declineConfirm')}
                  </button>
                  <button
                    type="button"
                    disabled={working}
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
            {error ? <Alert variant="error" className="mt-3">{error}</Alert> : null}
          </>
        ) : null}
        </section>
      </dialog>
    </>
  )
}

function PriorMemory({
  booking,
  busy,
  error,
  onMark,
}: {
  booking: OwnerBooking
  busy: string | null
  error: string | null
  onMark: () => void
}) {
  const { t } = useTranslation()
  const working = busy !== null
  const rows = booking.priorConfirmedBookings ?? []
  const stamped = booking.noShowAt != null && booking.noShowAt !== ''
  const canMark =
    booking.status === 'CONFIRMED' && !stamped && booking.preferredStartsAt !== null && Date.parse(booking.preferredStartsAt) <= Date.now()

  return (
    <div className="mt-4">
      {stamped ? <p className="text-sm font-semibold text-ink">{t('owner.noShow')}</p> : null}
      {canMark ? (
        <button
          type="button"
          disabled={working}
          onClick={onMark}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
        >
          {busy === 'noShow' ? <Spinner /> : null}
          {t('owner.noShow')}
        </button>
      ) : null}
      {error ? <Alert variant="error" className="mt-3">{error}</Alert> : null}
      {booking.origin === 'PHONE' ? null : (
        <>
          <p className="mt-4 text-sm font-semibold text-ink">{t('owner.priorBookings')}</p>
          {rows.length === 0 ? (
            <p className="mt-1 text-sm text-muted">{t('owner.priorEmpty')}</p>
          ) : (
            <ul className="mt-1 space-y-1">
              {rows.map((row) => (
                <li key={row.id} className="text-sm text-body">
                  {formatCivilDate(row.preferredDate)}
                  {' · '}
                  {row.services.map((service) => service.name).join(', ')}
                  {row.noShowAt ? ` · ${t('owner.noShow')}` : ''}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

function PhoneCancel({
  booking,
  busy,
  open,
  onOpen,
  onClose,
  onConfirm,
}: {
  booking: OwnerBooking
  busy: string | null
  open: boolean
  onOpen: () => void
  onClose: () => void
  onConfirm: () => void
}) {
  const { t } = useTranslation()
  const working = busy !== null
  const beforeStart = booking.status === 'CONFIRMED' && booking.preferredStartsAt !== null && Date.parse(booking.preferredStartsAt) > Date.now()
  if (booking.origin !== 'PHONE' || !beforeStart) {
    return null
  }

  return (
    <div className="mt-4">
      {open ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={working}
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
          >
            {busy === 'phoneCancel' ? <Spinner /> : null}
            {t('bookings.cancelBooking')}
          </button>
          <button
            type="button"
            disabled={working}
            onClick={onClose}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {t('owner.declineCancel')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={working}
          onClick={onOpen}
          className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
        >
          {t('owner.phone.cancel')}
        </button>
      )}
    </div>
  )
}
