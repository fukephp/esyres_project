import { useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { AdminShell } from '../components/AdminShell'
import { RowsSkeleton } from '../components/Skeleton'
import {
  APPROVE_SALON,
  PENDING_SALONS_QUERY,
  REJECT_SALON,
  type PendingSalonsData,
} from '../graphql/admin'

export function AdminPending() {
  const { t } = useTranslation()
  const { data, loading, refetch } = useQuery<PendingSalonsData>(PENDING_SALONS_QUERY)
  const [approve, { loading: approving }] = useMutation(APPROVE_SALON, {
    refetchQueries: ['PendingSalons', 'AdminOverview'],
  })
  const [reject, { loading: rejecting }] = useMutation(REJECT_SALON, {
    refetchQueries: ['PendingSalons', 'AdminOverview'],
  })
  const rows = data?.pendingSalons ?? []
  const busy = approving || rejecting

  async function run(id: string, kind: 'approve' | 'reject') {
    if (busy) {
      return
    }
    const action = kind === 'approve' ? approve : reject
    await action({ variables: { id } })
    await refetch()
  }

  return (
    <AdminShell active="pending">
      {loading && data == null ? (
        <RowsSkeleton count={3} />
      ) : rows.length === 0 ? (
        <p className="text-sm text-body">{t('admin.empty')}</p>
      ) : (
        <ul className="divide-y divide-hairline border-y border-hairline">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-semibold text-ink">{row.personName}</p>
                <p className="text-sm text-body">{row.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-canvas disabled:opacity-40"
                  onClick={() => void run(row.id, 'approve')}
                >
                  {t('admin.approve')}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="inline-flex h-10 items-center rounded-full border border-hairline px-4 text-sm font-semibold text-ink disabled:opacity-40"
                  onClick={() => void run(row.id, 'reject')}
                >
                  {t('admin.reject')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  )
}
