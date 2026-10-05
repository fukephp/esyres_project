import { useMutation, useQuery } from '@apollo/client'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LOGOUT_MUTATION, ME_QUERY, type MeData } from '../graphql/auth'
import { DISCOVERY_BRAND_KEY } from '../lib/homepage'
import { ownerRailExpanded } from '../lib/owner'
import { Spinner } from './ui'

const ADMIN_RAIL_KEY = 'esyres-admin-rail'

const logoutClass =
  'inline-flex h-10 items-center justify-center rounded-full bg-error-strong px-5 text-sm font-semibold text-canvas active:bg-error-strong-active disabled:opacity-40'

function readRail(): boolean {
  try {
    return ownerRailExpanded(localStorage.getItem(ADMIN_RAIL_KEY))
  } catch {
    return false
  }
}

const items = [
  { key: 'overview' as const, to: '/admin/dashboard', labelKey: 'admin.overview' },
  { key: 'pending' as const, to: '/admin/na-odobrenju', labelKey: 'admin.pending' },
]

export function AdminShell({ active, children }: { active: 'overview' | 'pending'; children: ReactNode }) {
  const { t } = useTranslation()
  const { data } = useQuery<MeData>(ME_QUERY)
  const [logout, { loading: loggingOut }] = useMutation(LOGOUT_MUTATION, { refetchQueries: ['Me'] })
  const [expanded, setExpanded] = useState(readRail)
  const name = data?.me?.name?.trim() ? data.me.name.trim() : null
  const title = t(active === 'overview' ? 'admin.overview' : 'admin.pending')

  function toggleRail() {
    const next = !expanded
    setExpanded(next)
    try {
      if (next) localStorage.setItem(ADMIN_RAIL_KEY, 'expanded')
      else localStorage.removeItem(ADMIN_RAIL_KEY)
    } catch {
      // in-memory width already updated
    }
  }

  return (
    <div className="min-h-svh bg-page text-ink md:flex">
      <aside
        className={`hidden bg-surface-dark px-4 py-6 text-on-dark md:sticky md:top-0 md:flex md:h-svh md:shrink-0 md:flex-col ${expanded ? 'md:w-60 md:items-stretch' : 'md:w-16 md:items-center'}`}
      >
        <div className={expanded ? 'flex w-full items-center justify-between gap-2' : 'flex flex-col items-center gap-2'}>
          <Link to="/" aria-label={t(DISCOVERY_BRAND_KEY)} className={`flex items-center ${expanded ? 'min-w-0 gap-2' : 'justify-center'}`}>
            <img src="/esyres-mark.svg" width={24} height={24} alt="" aria-hidden="true" />
            {expanded ? <span className="truncate font-display text-lg font-semibold">Esyres</span> : null}
          </Link>
          <button
            type="button"
            aria-label={t(expanded ? 'owner.collapseMenu' : 'owner.expandMenu')}
            className="flex size-8 items-center justify-center rounded-full bg-pastel-pink text-ink"
            onClick={toggleRail}
          >
            <span aria-hidden="true">{expanded ? '‹' : '›'}</span>
          </button>
        </div>
        <nav className={`mt-8 flex flex-col gap-1 text-sm ${expanded ? 'w-full' : 'items-center'}`}>
          {items.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              aria-label={t(item.labelKey)}
              className={`flex items-center rounded-full ${expanded ? 'h-10 w-full justify-start px-3' : 'h-10 w-10 justify-center'} ${active === item.key ? 'bg-canvas font-semibold text-ink' : 'text-on-dark-soft'}`}
            >
              {expanded ? t(item.labelKey) : t(item.labelKey).slice(0, 1)}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col items-center">
          <button
            type="button"
            aria-label={t('home.logout')}
            disabled={loggingOut}
            className={expanded ? `${logoutClass} w-full` : 'flex h-10 w-10 items-center justify-center rounded-full bg-error-strong text-canvas'}
            onClick={() => void logout()}
          >
            {loggingOut ? <Spinner className="size-5" /> : null}
            {expanded ? t('home.logout') : null}
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="flex items-center justify-between gap-3 px-5 pt-4 md:hidden">
          <Link to="/" aria-label={t(DISCOVERY_BRAND_KEY)}>
            <img src="/esyres-mark.svg" width={24} height={24} alt="" aria-hidden="true" />
          </Link>
          <button type="button" disabled={loggingOut} className={logoutClass} onClick={() => void logout()}>
            {loggingOut ? <Spinner className="mr-2 size-4" /> : null}
            {t('home.logout')}
          </button>
        </header>
        <div className="px-5 pt-6 md:px-10 md:pt-10">
          <p className="micro-label text-muted">{title}</p>
          <h1 className="font-display mt-1 text-[30px] font-semibold leading-tight text-ink md:text-[40px]">
            {name ? t('nav.welcome', { name }) : title}
          </h1>
        </div>
        <main className="px-5 py-6 md:px-10 md:py-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 bg-surface-dark text-[11px] font-semibold md:hidden">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`flex min-h-14 items-center justify-center ${active === item.key ? 'text-pastel-pink' : 'text-on-dark-soft'}`}
          >
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </div>
  )
}
