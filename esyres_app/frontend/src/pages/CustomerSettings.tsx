import { gql, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthShell } from '../components/AuthShell'
import { TopNav } from '../components/TopNav'
import { FormSkeleton, GuestPageSkeleton } from '../components/Skeleton'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { graphqlErrorCode } from '../lib/booking'
import { GUEST_COLUMN_CLASS } from '../lib/homepage'
import { SAVED_PLACES } from '../lib/savedPlace'

const UPDATE_CUSTOMER_SETTINGS = gql`
  mutation UpdateCustomerSettings($name: String!, $savedPlace: String) {
    updateCustomerSettings(name: $name, savedPlace: $savedPlace) {
      id
      name
      savedPlace
      savedLat
      savedLng
    }
  }
`

export function CustomerSettings() {
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const navMe = loading ? null : (data?.me ?? null)

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

  if (data?.me == null) {
    return (
      <div className="flex min-h-svh flex-col bg-page">
        <TopNav me={navMe} />
        <AuthShell place="customer" onAuthenticated={() => refetch()} />
      </div>
    )
  }

  return <SettingsForm me={data.me} />
}

function SettingsForm({ me }: { me: NonNullable<MeData['me']> }) {
  const { t } = useTranslation()
  const [name, setName] = useState(me.name)
  const [place, setPlace] = useState(me.savedPlace ?? '')
  const [error, setError] = useState<string | null>(null)
  const [save, { loading }] = useMutation(UPDATE_CUSTOMER_SETTINGS, {
    refetchQueries: [{ query: ME_QUERY }],
  })

  return (
    <>
      <TopNav me={me} />
      <main className={`${GUEST_COLUMN_CLASS} py-8`}>
        <form
          className="rounded-2xl border border-hairline bg-canvas px-4 py-4"
          onSubmit={(event) => {
            event.preventDefault()
            setError(null)
            void save({
              variables: { name, savedPlace: place === '' ? null : place },
            }).catch((err: unknown) => {
              setError(graphqlErrorCode(err) === 'INVALID_NAME' ? t('profile.invalidName') : t('profile.invalidName'))
            })
          }}
        >
          <label className="block text-sm font-medium text-ink" htmlFor="customer-name">
            {t('profile.name')}
          </label>
          <input
            id="customer-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-full border border-hairline bg-page px-4 py-2 text-sm text-ink"
          />
          <label className="mt-4 block text-sm font-medium text-ink" htmlFor="customer-place">
            {t('profile.place')}
          </label>
          <select
            id="customer-place"
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            className="mt-2 w-full rounded-full border border-hairline bg-page px-4 py-2 text-sm text-ink"
          >
            <option value="">{''}</option>
            {SAVED_PLACES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {error ? <p className="mt-3 text-sm text-body">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            {t('profile.save')}
          </button>
        </form>
      </main>
    </>
  )
}
