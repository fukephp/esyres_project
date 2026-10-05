import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { AdminShell } from '../components/AdminShell'
import { TilesSkeleton } from '../components/Skeleton'
import { ADMIN_OVERVIEW_QUERY, type AdminOverviewData } from '../graphql/admin'

export function AdminDashboard() {
  const { t } = useTranslation()
  const { data, loading } = useQuery<AdminOverviewData>(ADMIN_OVERVIEW_QUERY)
  const counts = data?.adminOverview
  const rows = [
    { key: 'pending', value: counts?.pendingSalons },
    { key: 'salons', value: counts?.ownedSalons },
    { key: 'bookings', value: counts?.bookings },
  ] as const

  return (
    <AdminShell active="overview">
      {loading && counts == null ? (
        <TilesSkeleton />
      ) : (
        <dl className="grid gap-4 md:grid-cols-3">
          {rows.map((row) => (
            <div key={row.key} className="rounded-[20px] bg-canvas px-5 py-4">
              <dt className="text-sm text-muted">{t(`admin.counts.${row.key}`)}</dt>
              <dd className="mt-2 font-display text-[40px] font-semibold text-ink">{row.value ?? 0}</dd>
            </div>
          ))}
        </dl>
      )}
    </AdminShell>
  )
}
