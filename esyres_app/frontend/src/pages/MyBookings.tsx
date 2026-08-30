import { useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { LOGOUT_MUTATION, ME_QUERY, type MeData } from '../graphql/auth'

function VerifyBanner() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  if (params.get('verified') === '1') {
    return <p className="mt-4 text-sm text-ink">{t('verify.confirmed')}</p>
  }
  if (params.get('verify') === 'invalid') {
    return <p className="mt-4 text-sm text-body">{t('verify.invalid')}</p>
  }
  if (params.get('verify') === 'mismatch') {
    return <p className="mt-4 text-sm text-body">{t('verify.mismatch')}</p>
  }
  return null
}

export function MyBookings() {
  const { t } = useTranslation()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const [logout] = useMutation(LOGOUT_MUTATION, { refetchQueries: ['Me'] })

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-5 py-8 text-body">
        <p>{t('salon.loading')}</p>
      </main>
    )
  }

  if (data?.me == null) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
          {t('bookings.title')}
        </h1>
        <VerifyBanner />
        <div className="mt-8">
          <AuthShell onAuthenticated={() => refetch()} />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
        {t('bookings.title')}
      </h1>
      <VerifyBanner />
      {data.me.emailVerified ? null : (
        <div className="mt-8">
          <EmailVerifyPanel />
        </div>
      )}
      <p className="mt-8 text-sm text-body">{t('bookings.empty')}</p>
      <button
        type="button"
        className="mt-6 text-sm text-body"
        onClick={() => void logout()}
      >
        {t('bookings.logout')}
      </button>
    </main>
  )
}
