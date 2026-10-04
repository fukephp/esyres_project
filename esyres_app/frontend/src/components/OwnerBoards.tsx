import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { OccupyingBooking, ZapisiBooking } from '../graphql/pending'
import { formatPickerDayNumeric } from '../lib/salonHours'
import { Alert, Spinner } from './ui'
import {
  STATUS_CARD_CLASS,
  currentJobLabel,
  bookingStartLabel,
  kanbanColumn,
  occupiedElapsedShare,
  occupyingBlock,
  occupyingByDay,
  occupyingClockRange,
  occupyingSarajevoYmd,
  sarajevoWeekday,
  workerDotColor,
  type KanbanColumn,
} from '../lib/owner'

function weekdayShort(t: (key: string) => string, ymd: string): string {
  return t(`weekday.${sarajevoWeekday(ymd)}`).slice(0, 3)
}

export function WeekHeader({ days, onShift }: { days: string[]; onShift: (delta: number) => void }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={t('owner.prevWeek')}
        onClick={() => onShift(-7)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-ink"
      >
        ‹
      </button>
      <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
        {formatPickerDayNumeric(days[0])} – {formatPickerDayNumeric(days[6])}
      </h2>
      <button
        type="button"
        aria-label={t('owner.nextWeek')}
        onClick={() => onShift(7)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-ink"
      >
        ›
      </button>
    </div>
  )
}

export function DayChips({
  days,
  date,
  closedFor,
  onDate,
  className = '',
}: {
  days: string[]
  date: string
  closedFor: (ymd: string) => boolean
  onDate: (ymd: string) => void
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div className={`grid grid-cols-7 gap-1.5 ${className}`}>
      {days.map((ymd) => {
        const selected = ymd === date
        return (
          <button
            key={ymd}
            type="button"
            aria-pressed={selected}
            onClick={() => onDate(ymd)}
            className={`flex flex-col items-center rounded-2xl py-2 text-xs ${
              selected ? 'bg-pastel-pink font-semibold text-ink' : closedFor(ymd) ? 'bg-surface-soft text-muted' : 'bg-surface-soft text-ink'
            }`}
          >
            <span className="micro-label">{weekdayShort(t, ymd)}</span>
            <span className="mt-0.5 text-base font-semibold tabular-nums">{Number(ymd.slice(8))}</span>
          </button>
        )
      })}
    </div>
  )
}

function ElapsedTrack({ share }: { share: number }) {
  const pct = Math.round(share * 100)

  return (
    <span className="mt-2 block h-1 overflow-hidden rounded-full bg-ink/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <span className="block h-full bg-ink" style={{ width: `${pct}%` }} />
    </span>
  )
}

export function OccupyingCard({ row, now, onOpen }: { row: OccupyingBooking; now: Date; onOpen: (id: string) => void }) {
  const { t } = useTranslation()
  const block = occupyingBlock(row)
  if (block === null) {
    return null
  }
  const ymd = occupyingSarajevoYmd(row)
  const share = row.status === 'CONFIRMED' && ymd !== null ? occupiedElapsedShare(ymd, block.start, block.durationMinutes, now) : null
  const tone: KanbanColumn = row.status === 'TIME_PROPOSED' ? 'proposed' : 'confirmed'
  const worker = row.status === 'TIME_PROPOSED' ? row.proposedWorker : row.worker

  return (
    <button
      type="button"
      onClick={() => onOpen(row.id)}
      className={`block w-full rounded-2xl p-3 text-left text-ink ${STATUS_CARD_CLASS[tone]}`}
    >
      <span className="block text-xs font-semibold tabular-nums">{occupyingClockRange(block.start, block.durationMinutes)}</span>
      <span className="mt-1 block text-sm font-semibold leading-snug">{row.customerName}</span>
      <span className="mt-0.5 block text-xs text-body">{block.label}</span>
      {worker ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs">
          <span className={`h-2 w-2 shrink-0 rounded-full ${workerDotColor(worker.id)}`} />
          {worker.name}
        </span>
      ) : (
        <span className="mt-1.5 block text-xs">{t('salon.noPreference')}</span>
      )}
      {row.status === 'TIME_PROPOSED' || row.noShowAt ? (
        <span className="mt-1.5 flex flex-wrap gap-1">
          {row.status === 'TIME_PROPOSED' ? (
            <span className="rounded-full bg-canvas/70 px-2 py-0.5 text-[11px] font-semibold">{t('bookings.status.TIME_PROPOSED')}</span>
          ) : null}
          {row.noShowAt ? (
            <span className="rounded-full bg-canvas/70 px-2 py-0.5 text-[11px] font-semibold">{t('owner.noShow')}</span>
          ) : null}
        </span>
      ) : null}
      {share !== null ? <ElapsedTrack share={share} /> : null}
    </button>
  )
}

export function WeekGrid({
  days,
  date,
  rows,
  closedFor,
  onDate,
  now,
  onOpen,
}: {
  days: string[]
  date: string
  rows: OccupyingBooking[]
  closedFor: (ymd: string) => boolean
  onDate: (ymd: string) => void
  now: Date
  onOpen: (id: string) => void
}) {
  const { t } = useTranslation()
  const selectedRows = occupyingByDay(rows, date)

  return (
    <>
      <div className="mt-5 hidden md:grid md:grid-cols-7 md:gap-3">
        {days.map((ymd) => {
          const selected = ymd === date
          const closed = closedFor(ymd)
          const dayRows = occupyingByDay(rows, ymd)
          return (
            <div key={ymd} className="min-w-0">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onDate(ymd)}
                className={`flex w-full flex-col items-center rounded-2xl py-2 ${selected ? 'bg-pastel-pink' : 'bg-surface-soft'}`}
              >
                <span className="micro-label text-muted">{weekdayShort(t, ymd)}</span>
                <span className="text-lg font-semibold tabular-nums text-ink">{Number(ymd.slice(8))}</span>
              </button>
              <div className="mt-2 space-y-2">
                {closed ? (
                  <p className="py-2 text-center text-xs text-muted">{t('owner.closed')}</p>
                ) : (
                  dayRows.map((row) => <OccupyingCard key={row.id} row={row} now={now} onOpen={onOpen} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 space-y-2 md:hidden">
        {closedFor(date) ? (
          <p className="text-sm text-muted">{t('owner.closedDay')}</p>
        ) : selectedRows.length === 0 ? (
          <p className="text-sm text-muted">{t('owner.dayFree')}</p>
        ) : (
          selectedRows.map((row) => <OccupyingCard key={row.id} row={row} now={now} onOpen={onOpen} />)
        )}
      </div>
    </>
  )
}

export function KanbanColumnToggles({
  showInProgress,
  showFinished,
  error,
  busy = false,
  onChange,
}: {
  showInProgress: boolean
  showFinished: boolean
  error: string | null
  busy?: boolean
  onChange: (showInProgress: boolean, showFinished: boolean) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          disabled={busy}
          checked={showInProgress}
          onChange={() => onChange(!showInProgress, showFinished)}
        />
        {t('owner.kanban.inProgress')}
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          disabled={busy}
          checked={showFinished}
          onChange={() => onChange(showInProgress, !showFinished)}
        />
        {t('owner.kanban.done')}
      </label>
      {busy ? <Spinner /> : null}
      {error !== null ? <Alert variant="error">{error}</Alert> : null}
    </div>
  )
}

export function KanbanBoard({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 mt-5 flex items-start snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
      {children}
    </div>
  )
}

export function BoardColumn({
  column,
  count,
  children,
}: {
  column: KanbanColumn
  count: number
  children: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <section className="w-[82%] shrink-0 snap-start rounded-3xl bg-surface-soft p-3 md:w-auto">
      <h3 className="flex items-center justify-between px-1 text-sm font-semibold text-ink">
        <span className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_CARD_CLASS[column]}`} />
          {t(`owner.kanban.${column}`)}
        </span>
        <span className="rounded-full bg-canvas px-2 py-0.5 text-xs tabular-nums">{count}</span>
      </h3>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  )
}

export function BookingCard({ row, onOpen, now, progress }: { row: ZapisiBooking; onOpen: (id: string) => void; now?: Date; progress?: number }) {
  const { t } = useTranslation()
  const column = kanbanColumn(row, now)
  const worker = row.status === 'TIME_PROPOSED' ? row.proposedWorker : row.worker

  return (
    <button type="button" onClick={() => onOpen(row.id)} className={`block w-full rounded-2xl p-3 text-left text-ink ${STATUS_CARD_CLASS[column]}`}>
      <span className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold tabular-nums">{bookingStartLabel(row) || t('owner.noTime')}</span>
        <span className="rounded-full bg-canvas/70 px-2 py-0.5 text-[11px] font-semibold">{originLabel(t, row.origin)}</span>
      </span>
      <span className="mt-1 block text-sm font-semibold leading-snug">{row.customerName}</span>
      <span className="mt-0.5 block text-xs text-body">{currentJobLabel(row.services)}</span>
      {worker ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs">
          <span className={`h-2 w-2 shrink-0 rounded-full ${workerDotColor(worker.id)}`} />
          {worker.name}
        </span>
      ) : (
        <span className="mt-1.5 block text-xs">{t('salon.noPreference')}</span>
      )}
      {column === 'done' ? <span className="mt-1 block text-[11px] font-semibold">{t(`bookings.status.${row.status}`)}</span> : null}
      {progress !== undefined ? <ElapsedTrack share={progress} /> : null}
    </button>
  )
}

export function originLabel(t: (key: string) => string, origin: ZapisiBooking['origin']): string {
  if (origin === 'ASSISTANT') {
    return t('owner.assistant')
  }
  if (origin === 'PHONE') {
    return t('owner.phone.button')
  }

  return t('owner.originGuest')
}
