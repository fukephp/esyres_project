import { useQuery } from '@apollo/client'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { isOwnerMe } from '../lib/homepage'
import { AuthShell } from './AuthShell'

export function AdminGate({ children }: { children: ReactNode }) {
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const me = data?.me
  const unknown = loading && data === undefined
  if (unknown) {
    return <div className="min-h-svh bg-page" />
  }
  if (me == null) {
    return (
      <div className="flex min-h-svh flex-col bg-page">
        <AuthShell place="panel" onAuthenticated={() => refetch()} />
      </div>
    )
  }
  if (!me.isAdmin) {
    return <Navigate to={isOwnerMe(me) ? '/owner' : '/'} replace />
  }
  return <>{children}</>
}
