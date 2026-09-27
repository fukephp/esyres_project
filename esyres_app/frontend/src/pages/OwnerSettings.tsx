import { useMutation, useQuery } from '@apollo/client'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { TopNav } from '../components/TopNav'
import { CHANGE_PASSWORD_MUTATION, ME_QUERY, type MeData } from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import { graphqlErrorCode } from '../lib/booking'
import { CREATE_SALON_PATH } from '../lib/createSalon'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import { useOwnerPush } from '../lib/push'

export function OwnerSettings() {
  const { t } = useTranslation()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const [changePassword, { loading: saving }] = useMutation(CHANGE_PASSWORD_MUTATION)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (saving) {
      return
    }
    setError(null)
    setSaved(false)
    if (next !== confirm) {
      setError(t('owner.passwordMismatch'))
      return
    }
    try {
      await changePassword({ variables: { currentPassword: current, password: next } })
      setCurrent('')
      setNext('')
      setConfirm('')
      setSaved(true)
    } catch (err) {
      const code = graphqlErrorCode(err)
      if (code === 'INVALID_CURRENT_PASSWORD') {
        setError(t('owner.passwordError.INVALID_CURRENT_PASSWORD'))
      } else if (code === 'WEAK_PASSWORD') {
        setError(t('auth.gate.WEAK_PASSWORD'))
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
          <OwnerNav salonId={firstOwnedId} firstOwnedId={firstOwnedId} badge={badge} active="settings" />
        </aside>
        <main className="flex-1 px-5 py-8">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.settings')}</h1>
          <p className="mt-2 text-sm text-body">{data.me.email}</p>
          <div className="md:hidden">
            <OwnerNav salonId={firstOwnedId} firstOwnedId={firstOwnedId} badge={badge} active="settings" />
          </div>
          <form className="mt-8 max-w-md space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <label className="block text-sm text-body">
              {t('owner.passwordCurrent')}
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
              />
            </label>
            <label className="block text-sm text-body">
              {t('owner.passwordNew')}
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
              />
            </label>
            <label className="block text-sm text-body">
              {t('owner.passwordConfirm')}
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
              />
            </label>
            {error ? <p className="text-sm text-busy-busy">{error}</p> : null}
            {saved ? <p className="text-sm text-ink">{t('owner.passwordChanged')}</p> : null}
            <button
              type="submit"
              disabled={saving}
              className="h-10 w-fit rounded-md bg-ink px-5 text-sm font-semibold text-canvas disabled:opacity-40 active:bg-[#242424]"
            >
              {t('owner.save')}
            </button>
          </form>
        </main>
      </div>
    </>
  )
}
