import { useMutation, useQuery } from '@apollo/client'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerShell } from '../components/OwnerShell'
import { TopNav } from '../components/TopNav'
import { Alert, Spinner } from '../components/ui'
import { OwnerPageSkeleton, FormSkeleton } from '../components/Skeleton'
import { ADD_SALON_MUTATION, ME_QUERY, type MeData } from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import { graphqlErrorCode } from '../lib/booking'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import { ownerSalonEditPath } from '../lib/owner'
import { useOwnerPush } from '../lib/push'

export function OwnerSalonCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const [addSalon, { loading: saving }] = useMutation<{ addSalon: { id: string } }>(ADD_SALON_MUTATION, {
    refetchQueries: ['Me'],
  })
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
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
    try {
      const result = await addSalon({ variables: { name, address } })
      const id = result.data?.addSalon?.id
      if (typeof id === 'string') {
        await refetch()
        navigate(ownerSalonEditPath(id))
      }
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
      <OwnerPageSkeleton>
        <FormSkeleton />
      </OwnerPageSkeleton>
    )
  }

  if (data?.me == null) {
    return (
      <div className="flex min-h-svh flex-col bg-page">
        <TopNav me={navMe} />
        <AuthShell place="panel" onAuthenticated={() => refetch()} />
      </div>
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
    return null
  }

  return (
    <>
      <OwnerShell
        personName={data.me.name}
        title={t('owner.addSalon')}
        salons={data.me.salons}
        salonId={firstOwnedId}
        firstOwnedId={firstOwnedId}
        badge={badge}
        active="salons"
      >
          <form className="max-w-md space-y-4 rounded-3xl bg-canvas p-5 md:p-6" onSubmit={(e) => void onSubmit(e)}>
            <label className="block text-sm text-body">
              {t('owner.salonName')}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field mt-1"
              />
            </label>
            <label className="block text-sm text-body">
              {t('owner.address')}
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="field mt-1"
              />
            </label>
            {error ? <Alert variant="error">{error}</Alert> : null}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-canvas disabled:opacity-40 active:bg-[#242424]"
            >
              {saving ? <Spinner /> : null}
              {t('owner.save')}
            </button>
          </form>
      </OwnerShell>
    </>
  )
}
