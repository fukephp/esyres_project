import { useMutation, useQuery } from '@apollo/client'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { CREATE_SALON_MUTATION, ME_QUERY, type MeData } from '../graphql/auth'
import { graphqlErrorCode } from '../lib/booking'
import { createSalonSurface } from '../lib/createSalon'

function Brand() {
  const { t } = useTranslation()
  return (
    <Link to="/" className="pitch-display flex items-center gap-2 text-lg text-ink">
      <img src="/esyres-mark.svg" width={24} height={24} alt="" aria-hidden="true" />
      {t('pitch.brand')}
    </Link>
  )
}

export function CreateSalon() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const [createSalon, { loading: saving }] = useMutation(CREATE_SALON_MUTATION, {
    refetchQueries: ['Me'],
  })
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <main className="px-5 py-8 text-body">
        <p>{t('salon.loading')}</p>
      </main>
    )
  }

  const surface = createSalonSurface(data?.me ?? null)
  if (surface === 'redirect-owner') {
    return <Navigate to="/owner" replace />
  }
  if (surface === 'auth') {
    return (
      <main className="company-pitch mx-auto max-w-md px-5 py-8">
        <Brand />
        <div className="mt-8">
          <AuthShell allowRegister onAuthenticated={() => refetch()} />
        </div>
      </main>
    )
  }
  if (surface === 'verify') {
    return (
      <main className="company-pitch mx-auto max-w-md px-5 py-8">
        <Brand />
        <div className="mt-8">
          <EmailVerifyPanel />
        </div>
      </main>
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
    <main className="company-pitch mx-auto flex min-h-svh max-w-md flex-col px-5 py-8">
      <Brand />
      <form className="mt-10 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <label className="block text-sm text-body">
          {t('createSalon.name')}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
          />
        </label>
        {error ? <p className="text-sm text-busy-busy">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="h-10 w-fit rounded-md bg-ink px-5 text-sm font-semibold text-canvas disabled:opacity-40 active:bg-[#242424]"
        >
          {t('createSalon.submit')}
        </button>
      </form>
    </main>
  )
}
