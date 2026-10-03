import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { TopNav } from '../components/TopNav'
import { CardsSkeleton, GuestPageSkeleton } from '../components/Skeleton'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { MY_BOOKINGS_QUERY, type MyBooking, type MyBookingsData } from '../graphql/booking'
import { bookingClock, bookingStatusKey } from '../lib/booking'
import { formatCivilDate } from '../lib/format'
import { BOOKINGS_HREF, GUEST_COLUMN_CLASS, PROFILE_HREF } from '../lib/homepage'

function BookingSummary({ row }: { row: MyBooking }) {
  const { t } = useTranslation()
  const clock = bookingClock(row)
  return (
    <div className="rounded-2xl border border-hairline bg-canvas px-4 py-3">
      <p className="text-sm font-semibold text-muted">{t(`bookings.status.${bookingStatusKey(row.status)}`)}</p>
      <p className="mt-1 font-semibold text-ink">{row.salon.name}</p>
      <p className="mt-1 text-sm text-ink">
        {formatCivilDate(row.status === 'TIME_PROPOSED' && row.proposedDate !== null ? row.proposedDate : row.preferredDate)}
        {' '}
        {row.status === 'TIME_PROPOSED' && row.proposedStartsAtLabel !== null
          ? row.proposedStartsAtLabel
          : (row.preferredStartsAtLabel ?? t('owner.noTime'))}
      </p>
      <p className="mt-1 text-sm text-body">
        {row.services.map((service) => service.name).join(', ')}
        {' · '}
        {t('salon.duration', { n: row.durationMinutes })}
        {' · '}
        {clock.worker ? clock.worker.name : t('salon.noPreference')}
      </p>
    </div>
  )
}

export function MyProfile() {
  const { t } = useTranslation()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const list = useQuery<MyBookingsData>(MY_BOOKINGS_QUERY, { skip: data?.me == null })
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
        <AuthShell place="customer" onAuthenticated={() => refetch()} />
      </div>
    )
  }

  const newest = list.data?.myBookings[0]
  const name = data.me.name?.trim() ?? ''

  return (
    <>
      <TopNav me={navMe} />
      <main className={`${GUEST_COLUMN_CLASS} py-8`}>
        {name !== '' ? <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{name}</h1> : null}
        <div className="mt-6">
          {newest ? <BookingSummary row={newest} /> : <p className="text-sm text-body">{t('bookings.empty')}</p>}
          <Link to={BOOKINGS_HREF} className="mt-3 inline-block text-sm font-semibold text-ink">
            {t('bookings.seeAll')}
          </Link>
        </div>
        <Link to={`${PROFILE_HREF}/settings`} className="mt-8 inline-block text-sm font-semibold text-ink">
          {t('profile.settings')}
        </Link>
      </main>
    </>
  )
}
