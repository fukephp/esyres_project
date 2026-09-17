import { formatSarajevoTime, sarajevoNowMinutes, sarajevoToday } from './format'

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

export function shiftOwnerDate(ymd: string, deltaDays: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day, 12))
  next.setUTCDate(next.getUTCDate() + deltaDays)

  return [
    next.getUTCFullYear(),
    String(next.getUTCMonth() + 1).padStart(2, '0'),
    String(next.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

export function formatOwnerDayHeading(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const formatted = new Intl.DateTimeFormat('bs-BA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Sarajevo',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)))

  return formatted.replace(/\.$/, '')
}

export function queueChipInitial(name: string): string {
  const trimmed = name.trim()
  if (trimmed === '') {
    return '?'
  }

  return trimmed.charAt(0).toLocaleUpperCase('bs-BA')
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

export function overlayQueueChrome(pending: boolean): {
  tag: boolean
  clock: 'reschedule' | 'preferred'
  draggable: boolean
  propose: boolean
  decline: boolean
  acceptPreferred: boolean
  acceptReschedule: boolean
  dismiss: boolean
} {
  if (pending) {
    return {
      tag: true,
      clock: 'reschedule',
      draggable: false,
      propose: false,
      decline: false,
      acceptPreferred: false,
      acceptReschedule: true,
      dismiss: true,
    }
  }

  return {
    tag: false,
    clock: 'preferred',
    draggable: true,
    propose: true,
    decline: true,
    acceptPreferred: true,
    acceptReschedule: false,
    dismiss: false,
  }
}

export function queueRowClock(row: {
  reschedulePending: boolean
  rescheduleStartsAt: string | null
  preferredStartsAt: string
}): string {
  if (row.reschedulePending && row.rescheduleStartsAt !== null) {
    return row.rescheduleStartsAt
  }

  return row.preferredStartsAt
}

export function acceptErrorKey(code: string | null): 'SLOT_TAKEN' | 'NOT_REQUESTED' | 'NOT_RESCHEDULE' | 'fallback' {
  if (code === 'SLOT_TAKEN' || code === 'NOT_REQUESTED' || code === 'NOT_RESCHEDULE') {
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

export const SALON_WEEKDAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const

export type SalonHoursDayForm = {
  weekday: string
  closed: boolean
  opensAt: string
  closesAt: string
  breakOn: boolean
  breakStartsAt: string
  breakEndsAt: string
}

function clock(value: string): string {
  return value.slice(0, 5)
}

export function hoursAccordionSummary(
  day: Pick<SalonHoursDayForm, 'closed' | 'opensAt' | 'closesAt'>,
): { closed: true } | { closed: false; range: string } {
  if (day.closed || day.opensAt === '' || day.closesAt === '') {
    return { closed: true }
  }

  return { closed: false, range: `${clock(day.opensAt)}–${clock(day.closesAt)}` }
}

export function kmToFeninga(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.')
  if (trimmed === '') {
    return null
  }
  const n = Number(trimmed)
  if (Number.isNaN(n) || n < 0) {
    return null
  }

  return Math.round(n * 100)
}

export function feningaToKm(feninga: number): string {
  return (feninga / 100).toString()
}

export function toSalonHoursInput(days: SalonHoursDayForm[]): PanelHours[] {
  return SALON_WEEKDAYS.map((weekday) => {
    const day = days.find((row) => row.weekday === weekday)
    if (day === undefined || day.closed) {
      return {
        weekday,
        closed: true,
        opensAt: null,
        closesAt: null,
        breakStartsAt: null,
        breakEndsAt: null,
      }
    }

    return {
      weekday,
      closed: false,
      opensAt: clock(day.opensAt),
      closesAt: clock(day.closesAt),
      breakStartsAt: day.breakOn ? clock(day.breakStartsAt) : null,
      breakEndsAt: day.breakOn ? clock(day.breakEndsAt) : null,
    }
  })
}

export function hoursForDate(hours: PanelHours[], date: string): PanelHours | undefined {
  const weekday = sarajevoWeekday(date)

  return hours.find((row) => row.weekday === weekday)
}

export function salonIsOpenNow(hours: PanelHours[], now = new Date()): boolean {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sarajevo',
  }).format(now)
  const day = hoursForDate(hours, date)
  if (day === undefined || day.closed || day.opensAt === null || day.closesAt === null) {
    return false
  }
  const current = sarajevoNowMinutes(now)
  if (current < minutes(day.opensAt) || current >= minutes(day.closesAt)) {
    return false
  }
  if (day.breakStartsAt !== null && day.breakEndsAt !== null) {
    const breakStart = minutes(day.breakStartsAt)
    const breakEnd = minutes(day.breakEndsAt)
    if (current >= breakStart && current < breakEnd) {
      return false
    }
  }

  return true
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
  label: string
}

export function currentJobLabel(services: { name: string }[] | null | undefined): string {
  return (services ?? []).map((row) => row.name).join(', ')
}

export function occupyingColSpan(durationMinutes: number, remainingCells: number): number {
  if (remainingCells <= 0) {
    return 1
  }

  return Math.max(1, Math.min(Math.floor(durationMinutes / 15), remainingCells))
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

export function ownerSalonFromSearch(param: string | null, salons: { id: string }[]): string | null {
  if (salons.length === 0) {
    return null
  }
  if (param !== null && salons.some((row) => row.id === param)) {
    return param
  }

  return salons[0].id
}

export function ownerSearchParams(
  date: string,
  today = sarajevoToday(),
  salonId: string | null = null,
  firstOwnedId: string | null = null,
): URLSearchParams {
  const params = new URLSearchParams()
  if (date !== today) {
    params.set('date', date)
  }
  if (salonId !== null && firstOwnedId !== null && salonId !== firstOwnedId) {
    params.set('salon', salonId)
  }

  return params
}

export function ownerQueuePath(
  date: string,
  today = sarajevoToday(),
  salonId: string | null = null,
  firstOwnedId: string | null = null,
): string {
  const query = ownerSearchParams(date, today, salonId, firstOwnedId).toString()
  return query === '' ? '/owner' : `/owner?${query}`
}

export function ownerChatSearchParams(
  salonId: string | null = null,
  firstOwnedId: string | null = null,
): URLSearchParams {
  const params = new URLSearchParams()
  if (salonId !== null && firstOwnedId !== null && salonId !== firstOwnedId) {
    params.set('salon', salonId)
  }

  return params
}

export function ownerChatPath(salonId: string | null = null, firstOwnedId: string | null = null): string {
  const query = ownerChatSearchParams(salonId, firstOwnedId).toString()
  return query === '' ? '/owner/chats' : `/owner/chats?${query}`
}

export function ownerStatsPath(salonId: string | null = null, firstOwnedId: string | null = null): string {
  const query = ownerChatSearchParams(salonId, firstOwnedId).toString()
  return query === '' ? '/owner/stats' : `/owner/stats?${query}`
}

export const OWNER_SALONS_PATH = '/owner/salons'

export function ownerSalonsPath(): string {
  return OWNER_SALONS_PATH
}

export function ownerSalonEditPath(id: string): string {
  return `${OWNER_SALONS_PATH}/${id}`
}

export function ownerSalonCreatePath(): string {
  return `${OWNER_SALONS_PATH}/create`
}

export function statsHourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

export function assistantOriginVisible(intake: { id: string } | null | undefined): boolean {
  return intake != null
}

export type AssistantTranscriptStep = 'services' | 'worker' | 'date' | 'time'

export type AssistantTranscriptLine = { step: AssistantTranscriptStep; value: string }

export function assistantTranscriptLines(input: {
  services: { name: string }[]
  workerName: string | null
  preferredDate: string | null
  preferredTime: string | null
  noPreference: string
}): AssistantTranscriptLine[] {
  return [
    { step: 'services', value: input.services.map((row) => row.name).join(', ') },
    { step: 'worker', value: input.workerName ?? input.noPreference },
    { step: 'date', value: input.preferredDate ?? '' },
    { step: 'time', value: input.preferredTime ?? '' },
  ]
}

export function occupyingBlock(row: {
  status: string
  preferredStartsAt: string
  proposedStartsAt: string | null
  durationMinutes: number
  worker: { id: string } | null
  proposedWorker: { id: string } | null
  services?: { name: string }[] | null
}): OccupyingBlock | null {
  const label = currentJobLabel(row.services)
  if (row.status === 'TIME_PROPOSED' && row.proposedWorker !== null && row.proposedStartsAt !== null) {
    return {
      workerId: row.proposedWorker.id,
      start: formatSarajevoTime(row.proposedStartsAt),
      durationMinutes: row.durationMinutes,
      status: 'TIME_PROPOSED',
      label,
    }
  }
  if (row.status === 'CONFIRMED' && row.worker !== null) {
    return {
      workerId: row.worker.id,
      start: formatSarajevoTime(row.preferredStartsAt),
      durationMinutes: row.durationMinutes,
      status: 'CONFIRMED',
      label,
    }
  }

  return null
}

export const WORKER_DOT_COLORS = [
  'bg-badge-orange',
  'bg-badge-pink',
  'bg-badge-violet',
  'bg-badge-emerald',
  'bg-brand-accent',
  'bg-success',
  'bg-warning',
  'bg-error',
] as const

export type WorkerDotColor = (typeof WORKER_DOT_COLORS)[number]

export function workerDotColor(id: string): WorkerDotColor {
  let n = 0
  for (let i = 0; i < id.length; i++) {
    n = (n + id.charCodeAt(i) * (i + 1)) % WORKER_DOT_COLORS.length
  }

  return WORKER_DOT_COLORS[n]
}

export function ownerMonthFromYmd(ymd: string): { year: number; month: number } {
  const [year, month] = ymd.split('-').map(Number)

  return { year, month }
}

export function ownerMonthRange(year: number, month: number): { from: string; to: string } {
  const last = new Date(Date.UTC(year, month, 0, 12))
  const toDay = String(last.getUTCDate()).padStart(2, '0')
  const mm = String(month).padStart(2, '0')

  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${toDay}` }
}

export function shiftOwnerMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const next = new Date(Date.UTC(year, month - 1 + delta, 1, 12))

  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 }
}

export function ownerMonthContains(year: number, month: number, ymd: string): boolean {
  const parsed = ownerMonthFromYmd(ymd)

  return parsed.year === year && parsed.month === month
}

export function ownerMonthDays(year: number, month: number): string[] {
  const { from, to } = ownerMonthRange(year, month)
  const days: string[] = []
  let cursor = from
  while (cursor <= to) {
    days.push(cursor)
    cursor = shiftOwnerDate(cursor, 1)
  }

  return days
}

export function ownerMonthWeekdayOffset(year: number, month: number): number {
  const utcDay = new Date(Date.UTC(year, month - 1, 1, 12)).getUTCDay()

  return (utcDay + 6) % 7
}

export function formatOwnerMonthTitle(year: number, month: number): string {
  const formatted = new Intl.DateTimeFormat('bs-BA', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1, 12)))

  return formatted.replace(/\.$/, '')
}

export function occupyingClockRange(start: string, durationMinutes: number): string {
  return `${start}–${hhmm(minutes(start) + durationMinutes)}`
}

export function ownerDetailMode(status: string): 'form' | 'read' | 'bounce' {
  if (status === 'REQUESTED') {
    return 'form'
  }
  if (status === 'CONFIRMED' || status === 'TIME_PROPOSED') {
    return 'read'
  }

  return 'bounce'
}

export function occupyingStartIso(row: {
  status: string
  preferredStartsAt: string
  proposedStartsAt: string | null
}): string | null {
  if (row.status === 'TIME_PROPOSED') {
    return row.proposedStartsAt
  }
  if (row.status === 'CONFIRMED') {
    return row.preferredStartsAt
  }

  return null
}

export function occupyingSarajevoYmd(row: {
  status: string
  preferredStartsAt: string
  proposedStartsAt: string | null
}): string | null {
  const iso = occupyingStartIso(row)
  if (iso === null) {
    return null
  }

  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sarajevo' }).format(new Date(iso))
}

export function occupyingDotsForDay<T extends {
  status: string
  preferredStartsAt: string
  proposedStartsAt: string | null
  durationMinutes: number
  worker: { id: string } | null
  proposedWorker: { id: string } | null
}>(rows: T[], ymd: string, max = 3): { workerId: string; color: WorkerDotColor }[] {
  return rows
    .filter((row) => occupyingSarajevoYmd(row) === ymd && occupyingBlock(row) !== null)
    .sort((a, b) => (occupyingStartIso(a) ?? '').localeCompare(occupyingStartIso(b) ?? ''))
    .slice(0, max)
    .map((row) => {
      const block = occupyingBlock(row)
      if (block === null) {
        return { workerId: '', color: WORKER_DOT_COLORS[0] }
      }

      return { workerId: block.workerId, color: workerDotColor(block.workerId) }
    })
}

export function selectedDayOccupying<T extends {
  status: string
  preferredStartsAt: string
  proposedStartsAt: string | null
  durationMinutes: number
  worker: { id: string } | null
  proposedWorker: { id: string } | null
  services?: { name: string }[] | null
}>(rows: T[], now = new Date()): { soon: T[]; rest: T[] } {
  const soon: T[] = []
  const rest: T[] = []
  for (const row of rows) {
    if (occupyingBlock(row) === null) {
      continue
    }
    const iso = occupyingStartIso(row)
    if (iso !== null && isPreferredSoon(iso, now)) {
      soon.push(row)
    } else {
      rest.push(row)
    }
  }
  const byStart = (a: T, b: T) => (occupyingStartIso(a) ?? '').localeCompare(occupyingStartIso(b) ?? '')
  soon.sort(byStart)
  rest.sort(byStart)

  return { soon, rest }
}

export type SelectedDayRestItem<T> =
  | { kind: 'occupying'; booking: T; start: string }
  | { kind: 'break'; startsAt: string; endsAt: string }

export function mixRestWithBreak<T extends {
  status: string
  preferredStartsAt: string
  proposedStartsAt: string | null
  durationMinutes: number
  worker: { id: string } | null
  proposedWorker: { id: string } | null
  services?: { name: string }[] | null
}>(occupying: T[], breakStartsAt: string | null, breakEndsAt: string | null): SelectedDayRestItem<T>[] {
  const items: SelectedDayRestItem<T>[] = occupying.flatMap((booking) => {
    const block = occupyingBlock(booking)
    if (block === null) {
      return []
    }

    return [{ kind: 'occupying' as const, booking, start: block.start }]
  })
  if (breakStartsAt !== null && breakEndsAt !== null) {
    items.push({ kind: 'break', startsAt: breakStartsAt, endsAt: breakEndsAt })
  }
  items.sort((a, b) => {
    const aStart = a.kind === 'break' ? a.startsAt : a.start
    const bStart = b.kind === 'break' ? b.startsAt : b.start

    return aStart.localeCompare(bStart)
  })

  return items
}
