import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { sarajevoToday } from '../lib/format'
import { ownerChatPath, ownerQueuePath, ownerStatsPath } from '../lib/owner'

type Props = {
  salonId: string
  firstOwnedId: string
  date?: string
  badge: number | null
  active: 'queue' | 'chats' | 'stats'
  tone: 'dark' | 'light'
}

export function OwnerNav({ salonId, firstOwnedId, date, badge, active, tone }: Props) {
  const { t } = useTranslation()
  const today = sarajevoToday()
  const queue = ownerQueuePath(date ?? today, today, salonId, firstOwnedId)
  const chats = ownerChatPath(salonId, firstOwnedId)
  const stats = ownerStatsPath(salonId, firstOwnedId)
  const idle = tone === 'dark' ? 'text-on-dark/70' : 'text-body'
  const on = tone === 'dark' ? 'font-semibold text-on-dark' : 'font-semibold text-ink'
  const badgeClass =
    tone === 'dark'
      ? 'bg-canvas text-ink'
      : 'bg-ink text-canvas'

  return (
    <nav className="mt-6 flex flex-col gap-2 text-sm">
      <Link to={queue} className={active === 'queue' ? on : idle}>
        {t('owner.title')}
      </Link>
      <Link to={chats} className={active === 'chats' ? on : idle}>
        {t('owner.chat')}
        {badge !== null ? (
          <span className={`ml-2 inline-flex min-w-5 justify-center rounded-sm px-1.5 text-xs font-semibold ${badgeClass}`}>
            {badge}
          </span>
        ) : null}
      </Link>
      <Link to={stats} className={active === 'stats' ? on : idle}>
        {t('owner.stats')}
      </Link>
    </nav>
  )
}
