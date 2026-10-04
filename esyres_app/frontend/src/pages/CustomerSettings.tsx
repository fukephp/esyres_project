import { gql, useMutation } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '../components/ui'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { CUSTOMER_PRIMARY } from '../lib/customerUi'
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

const FIELD_CLASS =
  'mt-2 w-full rounded-full border border-[#c9d1d8] bg-canvas px-4 py-2.5 text-sm text-ink focus:border-ink focus:outline-none'

export function CustomerSettingsForm({ me }: { me: NonNullable<MeData['me']> }) {
  const { t } = useTranslation()
  const [name, setName] = useState(me.name)
  const [place, setPlace] = useState(me.savedPlace ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [save, { loading }] = useMutation(UPDATE_CUSTOMER_SETTINGS, {
    refetchQueries: [{ query: ME_QUERY }],
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setError(null)
        setSaved(false)
        void save({
          variables: { name, savedPlace: place === '' ? null : place },
        })
          .then(() => setSaved(true))
          .catch(() => {
            setError(t('profile.invalidName'))
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
        onChange={(event) => {
          setName(event.target.value)
          setSaved(false)
        }}
        className={FIELD_CLASS}
      />
      <label className="mt-5 block text-sm font-medium text-ink" htmlFor="customer-place">
        {t('profile.place')}
      </label>
      <select
        id="customer-place"
        value={place}
        onChange={(event) => {
          setPlace(event.target.value)
          setSaved(false)
        }}
        className={FIELD_CLASS}
      >
        <option value="">{''}</option>
        {SAVED_PLACES.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {error ? <p className="mt-3 text-sm text-body">{error}</p> : null}
      <button type="submit" disabled={loading} className={`mt-6 w-full ${CUSTOMER_PRIMARY}`}>
        {loading ? <Spinner /> : null}
        {saved ? t('profile.saved') : t('profile.save')}
      </button>
    </form>
  )
}
