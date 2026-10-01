import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { sarajevoToday } from '../lib/format'
import { OWNER_SALONS_PATH, OWNER_SETTINGS_PATH, ownerChatPath, ownerQueuePath, ownerStatsPath, ownerZapisiPath } from '../lib/owner'

export type OwnerNavActive = 'queue' | 'zapisi' | 'chats' | 'stats' | 'salons' | 'settings'

type Props = {
  salonId: string
  firstOwnedId: string
  date?: string
  badge: number | null
  active: OwnerNavActive
  variant: 'sidebar' | 'tabs'
}

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      {children}
    </svg>
  )
}

const ICONS: Record<OwnerNavActive, ReactNode> = {
  queue: (
    <NavIcon>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
    </NavIcon>
  ),
  zapisi: (
    <NavIcon>
      <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01" />
    </NavIcon>
  ),
  chats: (
    <NavIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 6h14v9H8l-3 3V6z" />
    </NavIcon>
  ),
  stats: (
    <NavIcon>
      <path strokeLinecap="round" d="M4 19V5M4 19h16M8 16v-3M12 16V8M16 16v-6" />
    </NavIcon>
  ),
  salons: (
    <NavIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16l-1 10H5L4 10zM9 10V7a3 3 0 0 1 6 0v3" />
    </NavIcon>
  ),
  settings: (
    <NavIcon>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5" />
    </NavIcon>
  ),
}

export function OwnerNav({ salonId, firstOwnedId, date, badge, active, variant }: Props) {
  const { t } = useTranslation()
  const today = sarajevoToday()
  const queue = ownerQueuePath(date ?? today, today, salonId, firstOwnedId)
  const zapisi = ownerZapisiPath(date ?? today, today, salonId, firstOwnedId)
  const chats = ownerChatPath(salonId, firstOwnedId)
  const stats = ownerStatsPath(salonId, firstOwnedId)
  const items: { key: OwnerNavActive; to: string; label: string; badge?: number | null; tab: boolean }[] = [
    { key: 'queue', to: queue, label: t('owner.title'), tab: true },
    { key: 'zapisi', to: zapisi, label: t('owner.zapisi'), tab: true },
    { key: 'chats', to: chats, label: t('owner.chat'), badge, tab: true },
    { key: 'stats', to: stats, label: t('owner.stats'), tab: false },
    { key: 'salons', to: OWNER_SALONS_PATH, label: t('owner.salons'), tab: true },
    { key: 'settings', to: OWNER_SETTINGS_PATH, label: t('owner.settings'), tab: true },
  ]
  const badgeClass = 'inline-flex min-w-5 justify-center rounded-full bg-pastel-pink px-1.5 text-xs font-semibold text-ink'

  if (variant === 'tabs') {
    return (
      <nav className="grid grid-cols-5 text-[11px] font-semibold">
        {items
          .filter((item) => item.tab)
          .map((item) => (
            <Link
              key={item.key}
              to={item.to}
              aria-label={item.label}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-1 ${active === item.key ? 'text-pastel-pink' : 'text-on-dark-soft'}`}
            >
              {ICONS[item.key]}
              {item.badge != null ? <span className={`absolute right-2 top-2 ${badgeClass}`}>{item.badge}</span> : null}
              <span className={`h-1 w-1 rounded-full ${active === item.key ? 'bg-pastel-pink' : 'bg-transparent'}`} />
            </Link>
          ))}
      </nav>
    )
  }

  return (
    <nav className="mt-8 flex flex-col items-center gap-1 text-sm">
      {items.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          aria-label={item.label}
          title={item.label}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full ${active === item.key ? 'bg-canvas font-semibold text-ink' : 'text-on-dark-soft active:text-on-dark'}`}
        >
          {ICONS[item.key]}
          {item.badge != null ? <span className={`absolute -right-1 -top-1 ${badgeClass}`}>{item.badge}</span> : null}
        </Link>
      ))}
    </nav>
  )
}
