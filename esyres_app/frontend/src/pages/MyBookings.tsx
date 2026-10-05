import { useMutation, useQuery } from '@apollo/client'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { PhoneOtpPanel } from '../components/PhoneOtpPanel'
import { TopNav } from '../components/TopNav'
import { Alert, Spinner } from '../components/ui'
import { CardsSkeleton, GuestPageSkeleton } from '../components/Skeleton'
import { ME_QUERY, type MeData } from '../graphql/auth'
import {
  ASK_OTHER_TIME_MUTATION,
  CANCEL_BOOKING_MUTATION,
  CONFIRM_PROPOSED_TIME_MUTATION,
  MY_BOOKINGS_QUERY,
  REJECT_PROPOSED_TIME_MUTATION,
  REQUEST_RESCHEDULE_MUTATION,
  type MyBooking,
  type MyBookingsData,
} from '../graphql/booking'
import {
  bookingClock,
  guestStatusKey,
  cancelChrome,
  cancelErrorKey,
  graphqlErrorCode,
  groupMyBookings,
  rescheduleChrome,
  rescheduleErrorKey,
  respondErrorKey,
} from '../lib/booking'
import {
  CUSTOMER_CARD,
  CUSTOMER_CHIP,
  CUSTOMER_ICON_BUTTON,
  CUSTOMER_LINK,
  CUSTOMER_SMALL_BUTTON,
  CUSTOMER_SMALL_PRIMARY,
} from '../lib/customerUi'
import { formatCivilDate } from '../lib/format'
import { GUEST_COLUMN_CLASS } from '../lib/homepage'

const SECTION_TITLE_CLASS = 'text-base font-semibold text-ink'
import { useCustomerPush } from '../lib/push'

type Expand = { id: string; mode: 'reject' | 'ask' | 'reschedule' | 'cancel' } | null

function VerifyBanner() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  if (params.get('verified') === '1') {
    return <p className="mt-4 text-sm text-ink">{t('verify.confirmed')}</p>
  }
  if (params.get('verify') === 'invalid') {
    return <p className="mt-4 text-sm text-body">{t('verify.invalid')}</p>
  }
  if (params.get('verify') === 'mismatch') {
    return <p className="mt-4 text-sm text-body">{t('verify.mismatch')}</p>
  }
  return null
}

function BookingRow({
  row,
  className,
  label,
  headless = false,
  expand,
  askDate,
  askTime,
  busy,
  error,
  onConfirm,
  onRejectOpen,
  onAskOpen,
  onRescheduleOpen,
  onCancelOpen,
  onRejectConfirm,
  onAskSend,
  onCancelConfirm,
  onCancel,
  onAskDate,
  onAskTime,
}: {
  row: MyBooking
  className?: string
  label?: string
  headless?: boolean
  expand: Expand
  askDate: string
  askTime: string
  busy: boolean
  error?: string
  onConfirm: () => void
  onRejectOpen: () => void
  onAskOpen: () => void
  onRescheduleOpen: () => void
  onCancelOpen: () => void
  onRejectConfirm: () => void
  onAskSend: () => void
  onCancelConfirm: () => void
  onCancel: () => void
  onAskDate: (value: string) => void
  onAskTime: (value: string) => void
}) {
  const { t } = useTranslation()
  const clock = bookingClock(row)
  const proposed = row.status === 'TIME_PROPOSED'
  const chrome = rescheduleChrome({
    confirmed: row.status === 'CONFIRMED',
    pending: row.reschedulePending,
  })
  const canCancel =
    cancelChrome({
      confirmed: row.status === 'CONFIRMED',
      startsAt: row.preferredStartsAt ?? '',
      now: Date.now(),
    }) === 'show'
  const open = expand !== null && expand.id === row.id
  const rejectOpen = open && expand.mode === 'reject'
  const askOpen = open && expand.mode === 'ask'
  const rescheduleOpen = open && expand.mode === 'reschedule'
  const cancelOpen = open && expand.mode === 'cancel'

  return (
    <div className={className}>
      {label ? <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p> : null}
      {headless ? null : (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Link to={`/salon/${row.salon.id}`} className={`text-base ${CUSTOMER_LINK}`}>
            {row.salon.name}
          </Link>
          <span className={CUSTOMER_CHIP}>{t(`bookings.status.${guestStatusKey(row)}`)}</span>
        </div>
      )}
      <p className="text-sm text-ink">
        {formatCivilDate(row.status === 'TIME_PROPOSED' && row.proposedDate !== null ? row.proposedDate : row.preferredDate)}
        {' '}
        {row.status === 'TIME_PROPOSED' && row.proposedStartsAtLabel !== null
          ? row.proposedStartsAtLabel
          : (row.preferredStartsAtLabel ?? t('owner.noTime'))}
      </p>
      <p className="mt-1 text-sm text-body">
        {row.services.map((s) => s.name).join(', ')}
        {' · '}
        {t('salon.duration', { n: row.durationMinutes })}
        {' · '}
        {clock.worker ? clock.worker.name : t('salon.noPreference')}
      </p>
      {row.status === 'DECLINED' && row.declineReason !== null && row.declineReason !== 'expired' ? (
        <p className="mt-1 text-sm text-body">{row.declineReason}</p>
      ) : null}
      {chrome === 'pending' ? (
        <div className="mt-2 space-y-1">
          <p className="text-sm text-body">{t('bookings.reschedulePending')}</p>
          {row.rescheduleStartsAt !== null ? (
            <button
              type="button"
              disabled={busy}
              onClick={onRescheduleOpen}
              className={CUSTOMER_SMALL_BUTTON}
            >
              {row.rescheduleDate !== null && row.rescheduleStartsAtLabel !== null
                ? `${formatCivilDate(row.rescheduleDate)} ${row.rescheduleStartsAtLabel}`
                : null}
            </button>
          ) : null}
        </div>
      ) : null}
      {chrome === 'ask' && !open ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onRescheduleOpen}
            className={CUSTOMER_SMALL_BUTTON}
          >
            {t('bookings.reschedule')}
          </button>
          {canCancel ? (
            <button
              type="button"
              disabled={busy}
              onClick={onCancelOpen}
              className={CUSTOMER_SMALL_BUTTON}
            >
              {t('bookings.cancelBooking')}
            </button>
          ) : null}
        </div>
      ) : null}
      {chrome === 'pending' && canCancel && !open ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancelOpen}
            className={CUSTOMER_SMALL_BUTTON}
          >
            {t('bookings.cancelBooking')}
          </button>
        </div>
      ) : null}
      {proposed && !open ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={CUSTOMER_SMALL_PRIMARY}
          >
            {busy ? <Spinner /> : null}
            {t('bookings.confirm')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onRejectOpen}
            className={CUSTOMER_SMALL_BUTTON}
          >
            {t('bookings.reject')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onAskOpen}
            className={CUSTOMER_SMALL_BUTTON}
          >
            {t('bookings.ask')}
          </button>
        </div>
      ) : null}
      {rejectOpen ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onRejectConfirm}
            className={CUSTOMER_SMALL_PRIMARY}
          >
            {busy ? <Spinner /> : null}
            {t('bookings.rejectConfirm')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className={CUSTOMER_SMALL_BUTTON}
          >
            {t('bookings.cancel')}
          </button>
        </div>
      ) : null}
      {askOpen || rescheduleOpen ? (
        <div className="mt-3 space-y-2">
          <label className="block text-sm text-body">
            {t('salon.date')}
            <input
              type="date"
              value={askDate}
              disabled={busy}
              onChange={(e) => onAskDate(e.target.value)}
              className="mt-1 w-full rounded-full border border-[#c9d1d8] bg-canvas px-4 py-2 text-ink"
            />
          </label>
          <label className="block text-sm text-body">
            {t('salon.time')}
            <input
              type="time"
              lang="bs-BA"
              step={900}
              value={askTime}
              disabled={busy}
              onChange={(e) => onAskTime(e.target.value)}
              className="mt-1 w-full rounded-full border border-[#c9d1d8] bg-canvas px-4 py-2 text-ink"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || askDate === '' || askTime === ''}
              onClick={onAskSend}
              className={CUSTOMER_SMALL_PRIMARY}
            >
              {busy ? <Spinner /> : null}
              {t('bookings.askSend')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className={CUSTOMER_SMALL_BUTTON}
            >
              {t('bookings.cancel')}
            </button>
          </div>
        </div>
      ) : null}
      {cancelOpen ? (
        <div className="mt-3 space-y-2">
          {row.lateToCancel ? <Alert variant="warning">{t('bookings.cancelLate')}</Alert> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={onCancelConfirm}
              className={CUSTOMER_SMALL_PRIMARY}
            >
              {busy ? <Spinner /> : null}
              {t('bookings.cancelConfirm')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className={CUSTOMER_SMALL_BUTTON}
            >
              {t('bookings.cancel')}
            </button>
          </div>
        </div>
      ) : null}
      {error ? <Alert variant="error" className="mt-2">{error}</Alert> : null}
    </div>
  )
}

export function MyBookings() {
  const { t } = useTranslation()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const loggedIn = data?.me != null
  useCustomerPush(loggedIn)
  const { data: list, loading: listLoading, refetch: refetchList } = useQuery<MyBookingsData>(MY_BOOKINGS_QUERY, {
    skip: !loggedIn,
  })
  const [confirmProposed] = useMutation(CONFIRM_PROPOSED_TIME_MUTATION)
  const [rejectProposed] = useMutation(REJECT_PROPOSED_TIME_MUTATION)
  const [askOther] = useMutation(ASK_OTHER_TIME_MUTATION)
  const [requestReschedule] = useMutation(REQUEST_RESCHEDULE_MUTATION)
  const [cancelBooking] = useMutation(CANCEL_BOOKING_MUTATION)
  const [expand, setExpand] = useState<Expand>(null)
  const [askDate, setAskDate] = useState('')
  const [askTime, setAskTime] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [historyOpen, setHistoryOpen] = useState<string | null>(null)

  function onExpand(next: Expand) {
    setExpand(next)
    setAskDate('')
    setAskTime('')
    if (next !== null) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[next.id]
        return copy
      })
    }
  }

  async function run(id: string, work: () => Promise<unknown>) {
    setBusyId(id)
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    try {
      await work()
      setExpand(null)
      await refetchList()
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [id]: t(
          expand?.mode === 'cancel'
            ? `bookings.cancelError.${cancelErrorKey(graphqlErrorCode(error))}`
            : expand?.mode === 'reschedule'
              ? `bookings.rescheduleError.${rescheduleErrorKey(graphqlErrorCode(error))}`
              : `bookings.respondError.${respondErrorKey(graphqlErrorCode(error))}`,
        ),
      }))
    } finally {
      setBusyId(null)
    }
  }

  const navMe = loading ? null : (data?.me ?? null)

  if (loading) {
    return (
      <>
        <TopNav me={navMe} />
        <GuestPageSkeleton>
          <CardsSkeleton />
        </GuestPageSkeleton>
      </>
    )
  }

  if (data?.me == null) {
    return (
      <div className="flex min-h-svh flex-col bg-page">
        <TopNav me={navMe} />
        <div className={`${GUEST_COLUMN_CLASS} pt-8 empty:hidden`}>
          <VerifyBanner />
        </div>
        <AuthShell place="customer" onAuthenticated={() => refetch()} />
      </div>
    )
  }

  const rows = list?.myBookings ?? []
  const groups = groupMyBookings(rows)

  return (
    <>
      <TopNav me={navMe} />
      <main className={`${GUEST_COLUMN_CLASS} py-8`}>
      <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
        {t('bookings.title')}
      </h1>
      <VerifyBanner />
      {data.me.emailVerified ? (
        data.me.phoneVerified ? null : (
          <div className="mt-8 max-w-md">
            <PhoneOtpPanel />
          </div>
        )
      ) : (
        <div className="mt-8 max-w-md">
          <EmailVerifyPanel />
        </div>
      )}
      {listLoading ? (
        <CardsSkeleton className="mt-8" />
      ) : rows.length === 0 ? (
        <p className={`mt-8 ${CUSTOMER_CARD} text-sm text-body`}>{t('bookings.empty')}</p>
      ) : (
        <div className="mt-8 grid items-start gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:grid-rows-[auto_1fr]">
          <section className="md:col-start-1 md:row-start-1">
            <h2 className={SECTION_TITLE_CLASS}>{t('bookings.onHold')}</h2>
            {groups.onHold.length === 0 ? (
              <p className={`mt-3 ${CUSTOMER_CARD} text-sm text-body`}>{t('bookings.onHoldEmpty')}</p>
            ) : (
              <ul className="mt-3 grid gap-3">
                {groups.onHold.map((row) => (
                  <li key={row.id}>{renderRow(row, { className: CUSTOMER_CARD })}</li>
                ))}
              </ul>
            )}
          </section>
          {groups.lastConfirmed !== null || groups.lastDeclined !== null ? (
            <div className="grid gap-3 md:col-start-2 md:row-span-2 md:row-start-1 md:pt-9">
              {groups.lastConfirmed !== null
                ? renderRow(groups.lastConfirmed, { className: CUSTOMER_CARD, label: t('bookings.lastConfirmed') })
                : null}
              {groups.lastDeclined !== null
                ? renderRow(groups.lastDeclined, { className: CUSTOMER_CARD, label: t('bookings.lastDeclined') })
                : null}
            </div>
          ) : null}
          {groups.history.length > 0 ? (
            <section className="md:col-start-1 md:row-start-2">
              <h2 className={SECTION_TITLE_CLASS}>{t('bookings.history')}</h2>
              <ul className={`mt-3 ${CUSTOMER_CARD} py-1 md:py-1`}>
                {groups.history.map((row) => (
                  <HistoryRow
                    key={row.id}
                    row={row}
                    open={historyOpen === row.id}
                    onToggle={() => {
                      setHistoryOpen((current) => (current === row.id ? null : row.id))
                      onExpand(null)
                    }}
                  >
                    {renderRow(row, { className: 'pb-4', headless: true })}
                  </HistoryRow>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
      </main>
    </>
  )

  function renderRow(row: MyBooking, extra: { className?: string; label?: string; headless?: boolean }) {
    return (
      <BookingRow
        key={row.id}
        row={row}
        {...extra}
        expand={expand}
        askDate={askDate}
        askTime={askTime}
        busy={busyId === row.id}
        error={errors[row.id]}
        onConfirm={() => void run(row.id, () => confirmProposed({ variables: { bookingId: row.id } }))}
        onRejectOpen={() => onExpand({ id: row.id, mode: 'reject' })}
        onAskOpen={() => onExpand({ id: row.id, mode: 'ask' })}
        onRescheduleOpen={() => onExpand({ id: row.id, mode: 'reschedule' })}
        onCancelOpen={() => onExpand({ id: row.id, mode: 'cancel' })}
        onRejectConfirm={() => void run(row.id, () => rejectProposed({ variables: { bookingId: row.id } }))}
        onAskSend={() =>
          void run(row.id, () => {
            const variables = {
              bookingId: row.id,
              preferredDate: askDate,
              preferredTime: askTime.slice(0, 5),
            }
            return expand?.mode === 'reschedule'
              ? requestReschedule({ variables })
              : askOther({ variables })
          })
        }
        onCancelConfirm={() => void run(row.id, () => cancelBooking({ variables: { bookingId: row.id } }))}
        onCancel={() => onExpand(null)}
        onAskDate={setAskDate}
        onAskTime={setAskTime}
      />
    )
  }
}

function HistoryRow({
  row,
  open,
  onToggle,
  children,
}: {
  row: MyBooking
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <li className="border-t border-hairline first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-3 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{row.salon.name}</span>
          <span className="mt-0.5 block truncate text-sm text-muted">
            {formatCivilDate(row.preferredDate)} {row.preferredStartsAtLabel ?? t('owner.noTime')}
            {' · '}
            {row.services.map((s) => s.name).join(', ')}
          </span>
        </span>
        <span className={CUSTOMER_CHIP}>{t(`bookings.status.${guestStatusKey(row)}`)}</span>
        <span className={`${CUSTOMER_ICON_BUTTON} size-8`} aria-hidden>
          <svg
            viewBox="0 0 24 24"
            className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
        <span className="sr-only">{t('bookings.details')}</span>
      </button>
      {open ? children : null}
    </li>
  )
}
