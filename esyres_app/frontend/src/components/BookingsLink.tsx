import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function BookingsLink({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <p className={className ?? 'mb-6 text-right'}>
      <Link to="/bookings" className="text-sm text-body">
        {t('bookings.link')}
      </Link>
    </p>
  )
}
