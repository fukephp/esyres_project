import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { PhoneOtpPanel } from '../components/PhoneOtpPanel'
import { LOGOUT_MUTATION, ME_QUERY, type MeData } from '../graphql/auth'
import {
  ASK_OTHER_TIME_MUTATION,
  CONFIRM_PROPOSED_TIME_MUTATION,
  MY_BOOKINGS_QUERY,
  REJECT_PROPOSED_TIME_MUTATION,
  type MyBooking,
  type MyBookingsData,
} from '../graphql/booking'
import { bookingClock, bookingStatusKey, graphqlErrorCode, respondErrorKey } from '../lib/booking'
import { formatSarajevoDateTime } from '../lib/format'

type Expand = { id: string; mode: 'reject' | 'ask' } | null

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
  expand,
  askDate,
  askTime,
  busy,
  error,
  onConfirm,
  onRejectOpen,
  onAskOpen,
  onRejectConfirm,
  onAskSend,
  onCancel,
  onAskDate,
  onAskTime,
}: {
  row: MyBooking
  expand: Expand
  askDate: string
  askTime: string
  busy: boolean
  error?: string
  onConfirm: () => void
  onRejectOpen: () => void
  onAskOpen: () => void
  onRejectConfirm: () => void
  onAskSend: () => void
  onCancel: () => void
  onAskDate: (value: string) => void
  onAskTime: (value: string) => void
}) {
  const { t } = useTranslation()
  const clock = bookingClock(row)
  const proposed = row.status === 'TIME_PROPOSED'
  const open = expand !== null && expand.id === row.id
  const rejectOpen = open && expand.mode === 'reject'
  const askOpen = open && expand.mode === 'ask'

  return (
    <li className="rounded-lg border border-hairline px-4 py-3">
      <p className="text-sm font-semibold text-muted">{t(`bookings.status.${bookingStatusKey(row.status)}`)}</p>
      <p className="mt-1 font-semibold text-ink">{row.salon.name}</p>
      <p className="mt-1 text-sm text-ink">{formatSarajevoDateTime(clock.startsAt)}</p>
      <p className="mt-1 text-sm text-body">
        {row.services.map((s) => s.name).join(', ')}
        {' · '}
        {t('salon.duration', { n: row.durationMinutes })}
        {' · '}
        {clock.worker ? clock.worker.name : t('salon.noPreference')}
      </p>
      {row.status === 'DECLINED' && row.declineReason !== null ? (
        <p className="mt-1 text-sm text-body">{row.declineReason}</p>
      ) : null}
      {proposed && !open ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
          >
            {t('bookings.confirm')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onRejectOpen}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {t('bookings.reject')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onAskOpen}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
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
            className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
          >
            {t('bookings.rejectConfirm')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            {t('bookings.cancel')}
          </button>
        </div>
      ) : null}
      {askOpen ? (
        <div className="mt-3 space-y-2">
          <label className="block text-sm text-body">
            {t('salon.date')}
            <input
              type="date"
              value={askDate}
              disabled={busy}
              onChange={(e) => onAskDate(e.target.value)}
              className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
            />
          </label>
          <label className="block text-sm text-body">
            {t('salon.time')}
            <input
              type="time"
              step={900}
              value={askTime}
              disabled={busy}
              onChange={(e) => onAskTime(e.target.value)}
              className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || askDate === '' || askTime === ''}
              onClick={onAskSend}
              className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
            >
              {t('bookings.askSend')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-40"
            >
              {t('bookings.cancel')}
            </button>
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-busy-busy">{error}</p> : null}
    </li>
  )
}

export function MyBookings() {
  const { t } = useTranslation()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const loggedIn = data?.me != null
  const { data: list, loading: listLoading, refetch: refetchList } = useQuery<MyBookingsData>(MY_BOOKINGS_QUERY, {
    skip: !loggedIn,
  })
  const [logout] = useMutation(LOGOUT_MUTATION, { refetchQueries: ['Me'] })
  const [confirmProposed] = useMutation(CONFIRM_PROPOSED_TIME_MUTATION)
  const [rejectProposed] = useMutation(REJECT_PROPOSED_TIME_MUTATION)
  const [askOther] = useMutation(ASK_OTHER_TIME_MUTATION)
  const [expand, setExpand] = useState<Expand>(null)
  const [askDate, setAskDate] = useState('')
  const [askTime, setAskTime] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
        [id]: t(`bookings.respondError.${respondErrorKey(graphqlErrorCode(error))}`),
      }))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-5 py-8 text-body">
        <p>{t('salon.loading')}</p>
      </main>
    )
  }

  if (data?.me == null) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
          {t('bookings.title')}
        </h1>
        <VerifyBanner />
        <div className="mt-8">
          <AuthShell onAuthenticated={() => refetch()} />
        </div>
      </main>
    )
  }

  const rows = list?.myBookings ?? []

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
        {t('bookings.title')}
      </h1>
      <VerifyBanner />
      {data.me.emailVerified ? (
        data.me.phoneVerified ? null : (
          <div className="mt-8">
            <PhoneOtpPanel />
          </div>
        )
      ) : (
        <div className="mt-8">
          <EmailVerifyPanel />
        </div>
      )}
      {listLoading ? (
        <p className="mt-8 text-sm text-body">{t('salon.loading')}</p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-sm text-body">{t('bookings.empty')}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((row) => (
            <BookingRow
              key={row.id}
              row={row}
              expand={expand}
              askDate={askDate}
              askTime={askTime}
              busy={busyId === row.id}
              error={errors[row.id]}
              onConfirm={() => void run(row.id, () => confirmProposed({ variables: { bookingId: row.id } }))}
              onRejectOpen={() => onExpand({ id: row.id, mode: 'reject' })}
              onAskOpen={() => onExpand({ id: row.id, mode: 'ask' })}
              onRejectConfirm={() => void run(row.id, () => rejectProposed({ variables: { bookingId: row.id } }))}
              onAskSend={() =>
                void run(row.id, () =>
                  askOther({
                    variables: {
                      bookingId: row.id,
                      preferredDate: askDate,
                      preferredTime: askTime.slice(0, 5),
                    },
                  }),
                )
              }
              onCancel={() => onExpand(null)}
              onAskDate={setAskDate}
              onAskTime={setAskTime}
            />
          ))}
        </ul>
      )}
      <button
        type="button"
        className="mt-6 text-sm text-body"
        onClick={() => void logout()}
      >
        {t('bookings.logout')}
      </button>
    </main>
  )
}
