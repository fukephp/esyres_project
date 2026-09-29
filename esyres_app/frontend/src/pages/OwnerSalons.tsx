import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerShell } from '../components/OwnerShell'
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
      <OwnerShell
        personName={data.me.name}
        title={t('owner.salons')}
        salons={salons}
        salonId={firstOwnedId}
        firstOwnedId={firstOwnedId}
        badge={badge}
        active="salons"
        action={
          <Link
            to={ownerSalonCreatePath()}
            aria-label={t('owner.addSalon')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-lg font-semibold text-canvas active:scale-[0.98] active:bg-[#242424]"
          >
            +
          </Link>
        }
      >
        <ul className="max-w-xl space-y-3">
          {salons.map((row) => {
            const open = salonIsOpenNow(row.hours)

            return (
              <li key={row.id} className="flex items-center justify-between gap-3 rounded-2xl bg-canvas p-5">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">{row.name}</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-body">
                    <span className={`h-2 w-2 rounded-full ${open ? 'bg-busy-free' : 'bg-muted'}`} />
                    {t(open ? 'owner.openNow' : 'owner.closedNow')}
                  </p>
                </div>
                <Link
                  to={ownerSalonEditPath(row.id)}
                  className="inline-flex h-10 shrink-0 items-center rounded-full bg-surface-card px-5 text-sm font-semibold text-ink"
                >
                  {t('owner.edit')}
                </Link>
              </li>
            )
          })}
        </ul>
      </OwnerShell>
    </>
  )
}
