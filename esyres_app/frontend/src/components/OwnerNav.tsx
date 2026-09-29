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
              className={`flex min-h-14 flex-col items-center justify-center gap-1 ${active === item.key ? 'text-pastel-pink' : 'text-on-dark-soft'}`}
            >
              <span className="flex items-center gap-1">
                {item.label}
                {item.badge != null ? <span className={badgeClass}>{item.badge}</span> : null}
              </span>
              <span className={`h-1 w-1 rounded-full ${active === item.key ? 'bg-pastel-pink' : 'bg-transparent'}`} />
            </Link>
          ))}
      </nav>
    )
  }

  return (
    <nav className="mt-8 flex flex-col gap-1 text-sm">
      {items.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          className={`flex items-center justify-between rounded-full px-4 py-2.5 ${active === item.key ? 'bg-canvas font-semibold text-ink' : 'text-on-dark-soft active:text-on-dark'}`}
        >
          {item.label}
          {item.badge != null ? <span className={badgeClass}>{item.badge}</span> : null}
        </Link>
      ))}
    </nav>
  )
}
