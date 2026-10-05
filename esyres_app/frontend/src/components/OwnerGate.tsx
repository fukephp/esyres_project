import { useQuery } from '@apollo/client'
import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { isOwnerMe } from '../lib/homepage'
import { ownerBounce } from '../lib/owner'

export function OwnerGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { data, loading } = useQuery<MeData>(ME_QUERY)
  const me = data?.me
  const unknown = loading && data === undefined
  const admin = !unknown && me?.isAdmin === true
  const bounce = !unknown && me != null && !isOwnerMe(me) && me.isAdmin !== true
  const bounced = useRef(false)

  useEffect(() => {
    if (!admin) {
      return
    }
    navigate('/admin/dashboard', { replace: true })
  }, [admin, navigate])

  useEffect(() => {
    if (!bounce || bounced.current) {
      return
    }
    bounced.current = true
    const state: unknown = window.history.state
    const idx = typeof state === 'object' && state !== null ? (state as { idx?: unknown }).idx : undefined
    if (ownerBounce(idx) === 'back') {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }
  }, [bounce, navigate])

  if (unknown || admin || bounce) {
    return <div className="min-h-svh bg-page" />
  }

  return <>{children}</>
}
