import { gql, useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { TopNav } from '../components/TopNav'
import { CardsSkeleton, GuestPageSkeleton } from '../components/Skeleton'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { UNSAVE_FAVORITE } from '../graphql/favorites'
import { MY_BOOKINGS_QUERY, type MyBooking, type MyBookingsData } from '../graphql/booking'
import { SUGGESTED_SALONS_QUERY, type DiscoverySalon, type SuggestedSalonsData } from '../graphql/discovery'
import { MyRatingsList } from './SalonRating'
import { bookingClock, bookingStatusKey } from '../lib/booking'
import { busyToken } from '../lib/busyToken'
import { discoveryAddressLine, discoverySalonCategoryNames } from '../lib/discovery'
import { formatCivilDate, sarajevoToday } from '../lib/format'
import { BOOKINGS_HREF, GUEST_COLUMN_CLASS, PROFILE_HREF } from '../lib/homepage'

const MY_RATINGS_QUERY = gql`
  query MyRatings {
    myRatings {
      id
      score
      comment
      salon {
        id
        name
      }
    }
  }
`

function SuggestedRow({ salon }: { salon: DiscoverySalon }) {
  const { t } = useTranslation()
  const token = busyToken(salon.busyLevel)
  const categories = discoverySalonCategoryNames(salon.serviceCategories)
  const address = discoveryAddressLine(salon.address)
  return (
    <li className="border-t border-hairline py-3">
      <div className="flex items-start justify-between gap-4">
        <Link to={`/salon/${salon.id}`} className="text-sm font-medium text-ink">
          {salon.name}
        </Link>
        <span className="text-sm text-body">{t(`salon.busy.${salon.busyLevel}`)}</span>
      </div>
      {categories.length > 0 ? <p className="mt-1 text-sm text-muted">{categories.join(', ')}</p> : null}
      {address !== null ? <p className="mt-1 text-sm text-muted">{address}</p> : null}
      <span className="sr-only">{token}</span>
    </li>
  )
}

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
  const [unsaveFavorite] = useMutation(UNSAVE_FAVORITE)
  const list = useQuery<MyBookingsData>(MY_BOOKINGS_QUERY, { skip: data?.me == null })
  const suggested = useQuery<SuggestedSalonsData>(SUGGESTED_SALONS_QUERY, {
    variables: { date: sarajevoToday() },
    skip: data?.me == null,
  })
  const mine = useQuery<{ myRatings: { id: string; score: number; comment: string | null; salon: { id: string; name: string } }[] }>(
    MY_RATINGS_QUERY,
    { skip: data?.me == null },
  )
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
        {(suggested.data?.suggestedSalons.length ?? 0) > 0 ? (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-ink">{t('profile.suggestions')}</h2>
            <ul className="mt-3">
              {suggested.data?.suggestedSalons.map((salon) => (
                <SuggestedRow key={salon.id} salon={salon} />
              ))}
            </ul>
          </section>
        ) : null}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-ink">{t('profile.favorites')}</h2>
          {(data.me.favoriteSalons ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-body">{t('profile.favoritesEmpty')}</p>
          ) : (
            <ul className="mt-3">
              {data.me.favoriteSalons.map((salon) => (
                <li key={salon.id} className="flex items-center justify-between gap-4 border-t border-hairline py-3">
                  <Link to={`/salon/${salon.id}`} className="text-sm font-semibold text-ink">
                    {salon.name}
                  </Link>
                  <button
                    type="button"
                    className="text-sm font-semibold text-ink"
                    onClick={() => {
                      void unsaveFavorite({ variables: { salonId: salon.id } }).then(() => refetch())
                    }}
                  >
                    {t('salon.saved')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <MyRatingsList rows={mine.data?.myRatings ?? []} />
        <Link to={`${PROFILE_HREF}/settings`} className="mt-8 inline-block text-sm font-semibold text-ink">
          {t('profile.settings')}
        </Link>
      </main>
    </>
  )
}
