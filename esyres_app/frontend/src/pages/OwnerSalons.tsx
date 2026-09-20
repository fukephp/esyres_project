import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { TopNav } from '../components/TopNav'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import { CREATE_SALON_PATH } from '../lib/createSalon'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import { ownerSalonCreatePath, ownerSalonEditPath, salonIsOpenNow } from '../lib/owner'
import { useOwnerPush } from '../lib/push'

export function OwnerSalons() {
  const { t } = useTranslation()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const navMe = loading ? null : (data?.me ?? null)
  const salons = data?.me?.salons ?? []
  const firstOwnedId = salons[0]?.id ?? ''
  const ownerReady = firstOwnedId !== '' && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const { data: countData } = useQuery<InFlightIntakeCountData>(IN_FLIGHT_INTAKE_COUNT_QUERY, {
    variables: { salonId: firstOwnedId },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const badge = chatBadgeCount(countData?.inFlightIntakeCount ?? 0)

  if (loading) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="px-5 py-8 text-body">
          <p>{t('salon.loading')}</p>
        </main>
      </>
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

  if (firstOwnedId === '') {
    return (
      <>
        <TopNav me={navMe} />
        <main className="mx-auto max-w-md px-5 py-8">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.title')}</h1>
          <p className="mt-8 text-sm text-body">{t('owner.notOwner')}</p>
          <Link to={CREATE_SALON_PATH} className="mt-4 inline-block text-sm font-semibold text-ink">
            {t('owner.createSalon')}
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <TopNav me={navMe} />
      <div className="min-h-svh md:flex">
        <aside className="hidden border-r border-hairline bg-canvas px-5 py-8 text-ink md:flex md:w-56 md:shrink-0 md:flex-col">
          <OwnerNav salonId={firstOwnedId} firstOwnedId={firstOwnedId} badge={badge} active="salons" />
        </aside>
        <main className="flex-1 px-5 py-8">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.salons')}</h1>
          <Link
            to={ownerSalonCreatePath()}
            aria-label={t('owner.addSalon')}
            className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-semibold text-canvas active:bg-[#242424]"
          >
            +
          </Link>
          <div className="md:hidden">
            <OwnerNav salonId={firstOwnedId} firstOwnedId={firstOwnedId} badge={badge} active="salons" />
          </div>
          <ul className="mt-8 max-w-xl space-y-3">
            {salons.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 border border-hairline p-5">
                <div>
                  <p className="font-medium text-ink">{row.name}</p>
                  <p className="text-sm text-body">{t(salonIsOpenNow(row.hours) ? 'owner.openNow' : 'owner.closedNow')}</p>
                </div>
                <Link
                  to={ownerSalonEditPath(row.id)}
                  className="inline-flex h-10 shrink-0 items-center rounded-md border border-hairline bg-canvas px-5 text-sm font-semibold text-ink"
                >
                  {t('owner.edit')}
                </Link>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </>
  )
}
