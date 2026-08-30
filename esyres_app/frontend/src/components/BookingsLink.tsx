import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function BookingsLink() {
  const { t } = useTranslation()
  return (
    <p className="mb-6 text-right">
      <Link to="/bookings" className="text-sm text-body">
        {t('bookings.link')}
      </Link>
    </p>
  )
}
