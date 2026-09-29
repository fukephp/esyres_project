import { useMutation } from '@apollo/client'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LOGOUT_MUTATION } from '../graphql/auth'
import { DISCOVERY_BRAND_KEY } from '../lib/homepage'
import { ownerStatsPath } from '../lib/owner'
import { OwnerNav, type OwnerNavActive } from './OwnerNav'

const logoutClass =
  'inline-flex h-10 items-center justify-center rounded-full bg-error-strong px-5 text-sm font-semibold text-canvas active:bg-error-strong-active'

type Props = {
  personName: string | null
  title: string
  salons: { id: string; name: string }[]
  salonId: string
  firstOwnedId: string
  date?: string
  badge: number | null
  active: OwnerNavActive
  onSalon?: (id: string) => void
  action?: ReactNode
  children: ReactNode
}

export function OwnerShell({
  personName,
  title,
  salons,
  salonId,
  firstOwnedId,
  date,
  badge,
  active,
  onSalon,
  action,
  children,
}: Props) {
  const { t } = useTranslation()
  const [logout] = useMutation(LOGOUT_MUTATION, { refetchQueries: ['Me'] })
  const salon = salons.find((row) => row.id === salonId) ?? null
  const name = personName?.trim() ? personName.trim() : null

  return (
    <div className="min-h-svh bg-page text-ink md:flex">
      <aside className="hidden bg-surface-dark px-4 py-6 text-on-dark md:sticky md:top-0 md:flex md:h-svh md:w-60 md:shrink-0 md:flex-col">
        <Link to="/" className="pitch-display flex items-center gap-2 px-2 text-xl text-on-dark">
          <img src="/esyres-mark.svg" width={24} height={24} alt="" aria-hidden="true" className="invert" />
          {t(DISCOVERY_BRAND_KEY)}
        </Link>
        <div className="mt-8 px-2">
          <SalonSwitcher salons={salons} salon={salon} onSalon={onSalon} dark />
        </div>
        <OwnerNav salonId={salonId} firstOwnedId={firstOwnedId} date={date} badge={badge} active={active} variant="sidebar" />
        <button type="button" className={`mt-auto ${logoutClass}`} onClick={() => void logout()}>
          {t('home.logout')}
        </button>
      </aside>
      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="flex items-center gap-3 px-5 pt-4 md:hidden">
          <Link to="/" className="shrink-0" aria-label={t(DISCOVERY_BRAND_KEY)}>
            <img src="/esyres-mark.svg" width={24} height={24} alt="" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <SalonSwitcher salons={salons} salon={salon} onSalon={onSalon} dark={false} />
          </div>
          {active === 'stats' ? null : (
            <Link to={ownerStatsPath(salonId, firstOwnedId)} className="text-sm text-body">
              {t('owner.stats')}
            </Link>
          )}
          <button type="button" className={logoutClass} onClick={() => void logout()}>
            {t('home.logout')}
          </button>
        </header>
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-6 md:px-10 md:pt-10">
          <div className="min-w-0">
            <p className="micro-label text-muted">{title}</p>
            <h1 className="font-display mt-1 text-[30px] font-semibold leading-tight text-ink md:text-[40px]">
              {name ? t('nav.welcome', { name }) : title}
            </h1>
          </div>
          {action}
        </div>
        <main className="px-5 py-6 md:px-10 md:py-8">{children}</main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 bg-surface-dark md:hidden">
        <OwnerNav salonId={salonId} firstOwnedId={firstOwnedId} date={date} badge={badge} active={active} variant="tabs" />
      </div>
    </div>
  )
}

function SalonSwitcher({
  salons,
  salon,
  onSalon,
  dark,
}: {
  salons: { id: string; name: string }[]
  salon: { id: string; name: string } | null
  onSalon?: (id: string) => void
  dark: boolean
}) {
  const { t } = useTranslation()
  if (onSalon !== undefined && salon !== null && salons.length > 1) {
    return (
      <label className={`block text-xs ${dark ? 'text-on-dark-soft' : 'text-muted'}`}>
        <span className="sr-only md:not-sr-only">{t('owner.salon')}</span>
        <select
          value={salon.id}
          onChange={(e) => onSalon(e.target.value)}
          className={`mt-1 w-full rounded-full px-3 py-2 text-sm font-semibold ${dark ? 'bg-surface-dark-elevated text-on-dark' : 'border border-hairline bg-canvas text-ink'}`}
        >
          {salons.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
      </label>
    )
  }
  if (salon === null) {
    return null
  }

  return <p className={`truncate text-sm font-semibold ${dark ? 'text-on-dark' : 'text-ink'}`}>{salon.name}</p>
}
