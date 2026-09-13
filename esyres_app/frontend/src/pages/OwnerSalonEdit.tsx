import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { TopNav } from '../components/TopNav'
import { ME_QUERY, UPDATE_SALON_MUTATION, type MeData } from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import { CREATE_SALON_PATH } from '../lib/createSalon'
import { graphqlErrorCode } from '../lib/booking'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import { useOwnerPush } from '../lib/push'

export function OwnerSalonEdit() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const [updateSalon, { loading: saving }] = useMutation(UPDATE_SALON_MUTATION, {
    refetchQueries: ['Me'],
  })
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navMe = loading ? null : (data?.me ?? null)
  const salons = data?.me?.salons ?? []
  const firstOwnedId = salons[0]?.id ?? ''
  const salon = salons.find((row) => row.id === id)
  const ownerReady = firstOwnedId !== '' && data?.me?.emailVerified === true
  const navSalonId = salon?.id ?? firstOwnedId
  useOwnerPush(ownerReady)
  const { data: countData } = useQuery<InFlightIntakeCountData>(IN_FLIGHT_INTAKE_COUNT_QUERY, {
    variables: { salonId: navSalonId },
    skip: !ownerReady || navSalonId === '',
    fetchPolicy: 'network-only',
  })
  const badge = chatBadgeCount(countData?.inFlightIntakeCount ?? 0)

  useEffect(() => {
    if (salon === undefined) {
      return
    }
    setName(salon.name)
    setAddress(salon.address ?? '')
  }, [salon])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (saving || salon === undefined) {
      return
    }
    setError(null)
    try {
      await updateSalon({
        variables: { salonId: salon.id, input: { name, address } },
      })
    } catch (err) {
      const code = graphqlErrorCode(err)
      if (code === 'INVALID_NAME') {
        setError(t('owner.INVALID_NAME'))
      } else if (code === 'INVALID_ADDRESS') {
        setError(t('owner.INVALID_ADDRESS'))
      } else {
        setError(t('salon.gate.fallback'))
      }
    }
  }

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
          <OwnerNav salonId={navSalonId} firstOwnedId={firstOwnedId} badge={badge} active="salons" />
        </aside>
        <main className="flex-1 px-5 py-8">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
            {salon?.name ?? t('owner.FORBIDDEN')}
          </h1>
          <div className="md:hidden">
            <OwnerNav salonId={navSalonId} firstOwnedId={firstOwnedId} badge={badge} active="salons" />
          </div>
          {salon === undefined ? (
            <p className="mt-8 text-sm text-body">{t('owner.FORBIDDEN')}</p>
          ) : (
            <form className="mt-8 max-w-md space-y-4" onSubmit={(e) => void onSubmit(e)}>
              <label className="block text-sm text-body">
                {t('owner.salonName')}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
                />
              </label>
              <label className="block text-sm text-body">
                {t('owner.address')}
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
                />
              </label>
              {error ? <p className="text-sm text-busy-busy">{error}</p> : null}
              <button
                type="submit"
                disabled={saving}
                className="h-10 w-fit rounded-md bg-ink px-5 text-sm font-semibold text-canvas disabled:opacity-40 active:bg-[#242424]"
              >
                {t('owner.save')}
              </button>
            </form>
          )}
        </main>
      </div>
    </>
  )
}
