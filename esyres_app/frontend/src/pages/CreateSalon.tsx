import { useMutation, useQuery } from '@apollo/client'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { TopNav } from '../components/TopNav'
import { Alert, Spinner } from '../components/ui'
import { FormSkeleton, GuestPageSkeleton } from '../components/Skeleton'
import { CREATE_SALON_MUTATION, ME_QUERY, type MeData } from '../graphql/auth'
import { graphqlErrorCode } from '../lib/booking'
import { createSalonSurface } from '../lib/createSalon'
import { GUEST_COLUMN_CLASS, PLACE_HEADING_CLASS } from '../lib/homepage'

export function CreateSalon() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const navMe = loading ? null : (data?.me ?? null)
  const [createSalon, { loading: saving }] = useMutation(CREATE_SALON_MUTATION, {
    refetchQueries: ['Me'],
  })
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <>
        <TopNav me={navMe} />
        <GuestPageSkeleton>
          <FormSkeleton />
        </GuestPageSkeleton>
      </>
    )
  }

  const surface = createSalonSurface(data?.me ?? null)
  if (surface === 'redirect-owner') {
    return <Navigate to="/owner" replace />
  }
  if (surface === 'auth') {
    return (
      <div className="flex min-h-svh flex-col bg-page">
        <TopNav me={navMe} />
        <AuthShell place="panel" onAuthenticated={() => refetch()} />
      </div>
    )
  }
  if (surface === 'verify') {
    return (
      <>
        <TopNav me={navMe} />
        <main className={`${GUEST_COLUMN_CLASS} py-8`}>
          <h1 className={PLACE_HEADING_CLASS}>{t('auth.placePanel')}</h1>
          <div className="mt-8 max-w-md">
            <EmailVerifyPanel />
          </div>
        </main>
      </>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (saving) {
      return
    }
    setError(null)
    try {
      await createSalon({ variables: { name } })
      navigate('/owner')
    } catch (err) {
      const code = graphqlErrorCode(err)
      setError(code === 'INVALID_NAME' ? t('createSalon.INVALID_NAME') : t('salon.gate.fallback'))
    }
  }

  return (
    <>
      <TopNav me={navMe} />
      <main className={`${GUEST_COLUMN_CLASS} flex min-h-svh flex-col py-8`}>
        <form className="mt-10 max-w-md space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <label className="block text-sm text-body">
            {t('createSalon.name')}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
            />
          </label>
          {error ? <Alert variant="error">{error}</Alert> : null}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-canvas disabled:opacity-40 active:bg-[#242424]"
          >
            {saving ? <Spinner /> : null}
            {t('createSalon.submit')}
          </button>
        </form>
      </main>
    </>
  )
}
