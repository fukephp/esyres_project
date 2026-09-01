import { useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { PhoneOtpPanel } from '../components/PhoneOtpPanel'
import { LOGOUT_MUTATION, ME_QUERY, type MeData } from '../graphql/auth'
import { MY_BOOKINGS_QUERY, type MyBooking, type MyBookingsData } from '../graphql/booking'
import { bookingClock, bookingStatusKey } from '../lib/booking'
import { formatSarajevoDateTime } from '../lib/format'

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

function BookingRow({ row }: { row: MyBooking }) {
  const { t } = useTranslation()
  const clock = bookingClock(row)

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
    </li>
  )
}

export function MyBookings() {
  const { t } = useTranslation()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const loggedIn = data?.me != null
  const { data: list, loading: listLoading } = useQuery<MyBookingsData>(MY_BOOKINGS_QUERY, {
    skip: !loggedIn,
  })
  const [logout] = useMutation(LOGOUT_MUTATION, { refetchQueries: ['Me'] })

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
            <BookingRow key={row.id} row={row} />
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
