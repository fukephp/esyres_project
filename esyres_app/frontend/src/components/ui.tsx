import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function CloseButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      aria-label={t('salon.close')}
      title={t('salon.close')}
      onClick={onClick}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-ink hover:bg-surface-soft active:bg-surface-card"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  )
}

export function Spinner({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`motion-safe:animate-spin ${className}`} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity={0.25} strokeWidth={3} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  )
}

export type AlertVariant = 'error' | 'warning' | 'success' | 'info'

const ALERT_VARIANT: Record<AlertVariant, { box: string; icon: string; path: string }> = {
  error: {
    box: 'bg-error/10 text-ink',
    icon: 'text-error-strong',
    path: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6',
  },
  warning: {
    box: 'bg-warning/15 text-ink',
    icon: 'text-warning',
    path: 'M12 4 2.5 20h19L12 4ZM12 10v4M12 17h.01',
  },
  success: {
    box: 'bg-success/10 text-ink',
    icon: 'text-success',
    path: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l2.5 2.5L16 9.5',
  },
  info: {
    box: 'bg-surface-soft text-body',
    icon: 'text-muted',
    path: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
  },
}

export function Alert({ variant, children, className = '' }: { variant: AlertVariant; children: ReactNode; className?: string }) {
  const style = ALERT_VARIANT[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-sm ${style.box} ${className}`}
    >
      <svg viewBox="0 0 24 24" className={`mt-px size-[18px] shrink-0 ${style.icon}`} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={style.path} />
      </svg>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
