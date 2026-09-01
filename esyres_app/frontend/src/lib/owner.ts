import { formatSarajevoTime, sarajevoToday } from './format'

export { formatSarajevoTime }

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

export function isYmd(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match === null) {
    return false
  }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const dt = new Date(Date.UTC(year, month - 1, day))

  return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day
}

export function ownerDateFromSearch(param: string | null, today = sarajevoToday()): string {
  if (param !== null && isYmd(param)) {
    return param
  }

  return today
}

export function isPreferredSoon(iso: string, now = new Date()): boolean {
  const start = Date.parse(iso)
  if (Number.isNaN(start)) {
    return false
  }

  return start <= now.getTime() + TWO_HOURS_MS
}

export function canAcceptPreferredTime(worker: { id: string } | null): boolean {
  return worker !== null
}

export function acceptErrorKey(code: string | null): 'SLOT_TAKEN' | 'NOT_REQUESTED' | 'fallback' {
  if (code === 'SLOT_TAKEN' || code === 'NOT_REQUESTED') {
    return code
  }

  return 'fallback'
}

export function proposeErrorKey(
  code: string | null,
): 'SLOT_TAKEN' | 'NOT_REQUESTED' | 'OUTSIDE_HOURS' | 'PAST_TIME' | 'INVALID_WORKER' | 'fallback' {
  if (
    code === 'SLOT_TAKEN' ||
    code === 'NOT_REQUESTED' ||
    code === 'OUTSIDE_HOURS' ||
    code === 'PAST_TIME' ||
    code === 'INVALID_WORKER'
  ) {
    return code
  }

  return 'fallback'
}

export function trimDeclineReason(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '') {
    return null
  }

  return trimmed
}

export function declineErrorKey(code: string | null): 'NOT_REQUESTED' | 'REASON_TOO_LONG' | 'fallback' {
  if (code === 'NOT_REQUESTED' || code === 'REASON_TOO_LONG') {
    return code
  }

  return 'fallback'
}

export function isFifteenMinute(time: string): boolean {
  return /^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/.test(time)
}

export function sarajevoWeekday(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'Europe/Sarajevo',
  })
    .format(new Date(Date.UTC(year, month - 1, day, 12)))
    .toUpperCase()
}

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)

  return h * 60 + m
}

function hhmm(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export type PanelHours = {
  weekday: string
  closed: boolean
  opensAt: string | null
  closesAt: string | null
  breakStartsAt: string | null
  breakEndsAt: string | null
}

export function hoursForDate(hours: PanelHours[], date: string): PanelHours | undefined {
  const weekday = sarajevoWeekday(date)

  return hours.find((row) => row.weekday === weekday)
}

export type PanelCell = { time: string; off: boolean }

export function panelCells(hours: PanelHours | undefined): PanelCell[] {
  if (hours === undefined || hours.closed || hours.opensAt === null || hours.closesAt === null) {
    return []
  }
  const open = minutes(hours.opensAt)
  const close = minutes(hours.closesAt)
  const breakStart = hours.breakStartsAt !== null ? minutes(hours.breakStartsAt) : null
  const breakEnd = hours.breakEndsAt !== null ? minutes(hours.breakEndsAt) : null
  const cells: PanelCell[] = []
  for (let t = open; t < close; t += 15) {
    const off = breakStart !== null && breakEnd !== null && t >= breakStart && t < breakEnd
    cells.push({ time: hhmm(t), off })
  }

  return cells
}

export type OccupyingBlock = {
  workerId: string
  start: string
  durationMinutes: number
  status: 'CONFIRMED' | 'TIME_PROPOSED'
}

export type CellKind = 'off' | 'booked' | 'proposed' | 'free'

export function cellKind(time: string, off: boolean, blocks: OccupyingBlock[], workerId: string): CellKind {
  if (off) {
    return 'off'
  }
  const start = minutes(time)
  for (const block of blocks) {
    if (block.workerId !== workerId) {
      continue
    }
    const from = minutes(block.start)
    const to = from + block.durationMinutes
    if (start >= from && start < to) {
      return block.status === 'CONFIRMED' ? 'booked' : 'proposed'
    }
  }

  return 'free'
}

export function canDropOnStart(kind: CellKind): boolean {
  return kind === 'free'
}

export function proposeStartTimes(cells: PanelCell[], blocks: OccupyingBlock[], workerId: string): string[] {
  return cells.filter((cell) => canDropOnStart(cellKind(cell.time, cell.off, blocks, workerId))).map((cell) => cell.time)
}

export function ownerQueuePath(date: string, today = sarajevoToday()): string {
  if (date === today) {
    return '/owner'
  }

  return `/owner?date=${date}`
}

export function occupyingBlock(row: {
  status: string
  preferredStartsAt: string
  proposedStartsAt: string | null
  durationMinutes: number
  worker: { id: string } | null
  proposedWorker: { id: string } | null
}): OccupyingBlock | null {
  if (row.status === 'TIME_PROPOSED' && row.proposedWorker !== null && row.proposedStartsAt !== null) {
    return {
      workerId: row.proposedWorker.id,
      start: formatSarajevoTime(row.proposedStartsAt),
      durationMinutes: row.durationMinutes,
      status: 'TIME_PROPOSED',
    }
  }
  if (row.status === 'CONFIRMED' && row.worker !== null) {
    return {
      workerId: row.worker.id,
      start: formatSarajevoTime(row.preferredStartsAt),
      durationMinutes: row.durationMinutes,
      status: 'CONFIRMED',
    }
  }

  return null
}
