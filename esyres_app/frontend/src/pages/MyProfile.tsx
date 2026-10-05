import { gql, useMutation, useQuery } from '@apollo/client'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Aside } from '../components/Aside'
import { AuthShell } from '../components/AuthShell'
import { TopNav } from '../components/TopNav'
import { CardsSkeleton, GuestPageSkeleton } from '../components/Skeleton'
import { Spinner } from '../components/ui'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { UNSAVE_FAVORITE } from '../graphql/favorites'
import { MY_BOOKINGS_QUERY, type MyBooking, type MyBookingsData } from '../graphql/booking'
import { SUGGESTED_SALONS_QUERY, type DiscoverySalon, type SuggestedSalonsData } from '../graphql/discovery'
import { CustomerSettingsForm } from './CustomerSettings'
import { MyRatingsList } from './SalonRating'
import { bookingClock, guestStatusKey } from '../lib/booking'
import { busyToken } from '../lib/busyToken'
import {
  CUSTOMER_CARD,
  CUSTOMER_CARD_TITLE,
  CUSTOMER_CHIP,
  CUSTOMER_ICON_BUTTON,
  CUSTOMER_LINK,
  CUSTOMER_SMALL_BUTTON,
} from '../lib/customerUi'
import { discoveryAddressLine, discoverySalonCategoryNames } from '../lib/discovery'
import { formatCivilDate, sarajevoToday } from '../lib/format'
import { BOOKINGS_HREF, GUEST_COLUMN_CLASS, isOwnerMe, PROFILE_HREF } from '../lib/homepage'

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

const SETTINGS_HREF = `${PROFILE_HREF}/settings`

function initials(name: string): string {
  const parts = name.split(/\s+/).filter((part) => part !== '')
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={CUSTOMER_CARD}>
      <div className="flex items-center justify-between gap-4 border-b border-hairline pb-3">
        <h2 className={CUSTOMER_CARD_TITLE}>{title}</h2>
        {action}
      </div>
      <div className="pt-3">{children}</div>
    </section>
  )
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}

function SuggestedRow({ salon }: { salon: DiscoverySalon }) {
  const { t } = useTranslation()
  const token = busyToken(salon.busyLevel)
  const categories = discoverySalonCategoryNames(salon.serviceCategories)
  const address = discoveryAddressLine(salon.address)
  return (
    <li className="border-t border-hairline py-3 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-4">
        <Link to={`/salon/${salon.id}`} className={`text-sm ${CUSTOMER_LINK}`}>
          {salon.name}
        </Link>
        <span className="shrink-0 text-xs text-muted">{t(`salon.busy.${salon.busyLevel}`)}</span>
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={`/salon/${row.salon.id}`} className={`text-base ${CUSTOMER_LINK}`}>
          {row.salon.name}
        </Link>
        <span className={CUSTOMER_CHIP}>{t(`bookings.status.${guestStatusKey(row)}`)}</span>
      </div>
      <p className="mt-2 text-sm text-ink">
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
  const navigate = useNavigate()
  const settingsOpen = useLocation().pathname === SETTINGS_HREF
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const [unsaveFavorite] = useMutation(UNSAVE_FAVORITE)
  const [unsavingId, setUnsavingId] = useState<string | null>(null)
  const customer = data?.me != null && !isOwnerMe(data.me)
  const list = useQuery<MyBookingsData>(MY_BOOKINGS_QUERY, { skip: !customer })
  const suggested = useQuery<SuggestedSalonsData>(SUGGESTED_SALONS_QUERY, {
    variables: { date: sarajevoToday() },
    skip: !customer,
  })
  const mine = useQuery<{ myRatings: { id: string; score: number; comment: string | null; salon: { id: string; name: string } }[] }>(
    MY_RATINGS_QUERY,
    { skip: !customer },
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

  if (data.me.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (isOwnerMe(data.me)) {
    return <Navigate to="/owner" replace />
  }

  const me = data.me
  const newest = list.data?.myBookings[0]
  const name = me.name?.trim() ?? ''
  const favorites = me.favoriteSalons ?? []
  const ratings = mine.data?.myRatings ?? []
  const suggestions = suggested.data?.suggestedSalons ?? []

  return (
    <>
      <TopNav me={navMe} />
      <main className={`${GUEST_COLUMN_CLASS} py-8`}>
        <section className={`${CUSTOMER_CARD} relative`}>
          <button
            type="button"
            aria-label={t('profile.settings')}
            title={t('profile.settings')}
            className={`absolute right-4 top-4 ${CUSTOMER_ICON_BUTTON}`}
            onClick={() => navigate(SETTINGS_HREF)}
          >
            <GearIcon />
          </button>
          <div className="flex flex-col gap-6 pr-12 md:flex-row md:items-center">
            <div className="flex items-center gap-4 md:gap-6">
              <span
                aria-hidden
                className="flex size-16 shrink-0 items-center justify-center rounded-full border border-hairline bg-page text-xl font-semibold text-ink md:size-24 md:text-3xl"
              >
                {initials(name)}
              </span>
              <div className="min-w-0">
                {name !== '' ? (
                  <h1 className="font-display text-[24px] font-semibold tracking-tight text-ink md:text-[28px]">{name}</h1>
                ) : null}
                <p className="mt-1 text-sm text-muted">{me.savedPlace ?? t('profile.noPlace')}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 md:ml-auto md:flex md:gap-8 md:border-l md:border-hairline md:pl-8">
              <Meta label={t('bookings.title')} value={list.data?.myBookings.length ?? '–'} />
              <Meta label={t('profile.favorites')} value={favorites.length} />
              <Meta label={t('profile.ratings')} value={mine.data ? ratings.length : '–'} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid items-start gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-6">
            <Card
              title={t('bookings.latest')}
              action={
                <Link to={BOOKINGS_HREF} className={CUSTOMER_SMALL_BUTTON}>
                  {t('bookings.seeAll')}
                </Link>
              }
            >
              {newest ? <BookingSummary row={newest} /> : <p className="text-sm text-body">{t('bookings.empty')}</p>}
            </Card>
            <MyRatingsList rows={ratings} />
          </div>
          <div className="grid gap-6">
            {suggestions.length > 0 ? (
              <Card title={t('profile.suggestions')}>
                <ul>
                  {suggested.data?.suggestedSalons.map((salon) => (
                    <SuggestedRow key={salon.id} salon={salon} />
                  ))}
                </ul>
              </Card>
            ) : null}
            <Card title={t('profile.favorites')}>
              {favorites.length === 0 ? (
                <p className="text-sm text-body">{t('profile.favoritesEmpty')}</p>
              ) : (
                <ul>
                  {me.favoriteSalons.map((salon) => (
                    <li
                      key={salon.id}
                      className="flex items-center justify-between gap-4 border-t border-hairline py-3 first:border-t-0 first:pt-0"
                    >
                      <Link to={`/salon/${salon.id}`} className={`text-sm ${CUSTOMER_LINK}`}>
                        {salon.name}
                      </Link>
                      <button
                        type="button"
                        title={t('profile.remove')}
                        disabled={unsavingId !== null}
                        className={CUSTOMER_SMALL_BUTTON}
                        onClick={() => {
                          if (unsavingId !== null) {
                            return
                          }
                          setUnsavingId(salon.id)
                          void unsaveFavorite({ variables: { salonId: salon.id } })
                            .then(() => refetch())
                            .finally(() => setUnsavingId(null))
                        }}
                      >
                        {unsavingId === salon.id ? <Spinner /> : null}
                        {t('salon.saved')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Aside open={settingsOpen} onClose={() => navigate(PROFILE_HREF)} title={t('profile.settings')}>
        <CustomerSettingsForm key={me.id} me={me} />
      </Aside>
    </>
  )
}