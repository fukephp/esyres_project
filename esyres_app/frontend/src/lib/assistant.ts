import { bookingWorkerId } from './booking'
import type { BusyLevel } from './busyToken'

export type AssistantDayHours = {
  weekday: string
  closed: boolean
  opensAt: string | null
  closesAt: string | null
  breakStartsAt: string | null
  breakEndsAt: string | null
}

export type ProfileMode = 'idle' | 'picker' | 'chat' | 'sent'

export type AssistantStep = 'services' | 'worker' | 'date' | 'time' | 'send'

export type AssistantBookingInput = {
  salonId: string
  serviceIds: string[]
  workerId?: string
  preferredDate: string
  preferredTime: string
}

export function showChatCta(serviceCount: number, sent: boolean): boolean {
  return serviceCount > 0 && !sent
}

export function skipWorkerStep(workerCount: number): boolean {
  return workerCount === 0
}

export function isPickerOpen(mode: ProfileMode): boolean {
  return mode === 'picker'
}

export function isChatOpen(mode: ProfileMode): boolean {
  return mode === 'chat'
}

export function assistantCanSend(
  serviceIds: string[],
  preferredDate: string,
  preferredTime: string,
): boolean {
  return serviceIds.length > 0 && preferredDate !== '' && preferredTime !== ''
}

export function assistantStep(input: {
  serviceIds: string[]
  workerCount: number
  workerConfirmed: boolean
  preferredDate: string
  preferredTime: string
}): AssistantStep {
  if (input.serviceIds.length === 0) {
    return 'services'
  }
  if (!skipWorkerStep(input.workerCount) && !input.workerConfirmed) {
    return 'worker'
  }
  if (input.preferredDate === '') {
    return 'date'
  }
  if (input.preferredTime === '') {
    return 'time'
  }
  return 'send'
}

export function assistantBookingInput(input: {
  salonId: string
  serviceIds: string[]
  workerChoice: string
  preferredDate: string
  preferredTime: string
}): AssistantBookingInput | null {
  if (!assistantCanSend(input.serviceIds, input.preferredDate, input.preferredTime)) {
    return null
  }
  const booking: AssistantBookingInput = {
    salonId: input.salonId,
    serviceIds: input.serviceIds,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
  }
  const workerId = bookingWorkerId(input.workerChoice)
  if (workerId !== undefined) {
    booking.workerId = workerId
  }
  return booking
}

export function assistantHoursForDate(hours: AssistantDayHours[], date: string): AssistantDayHours | undefined {
  const [year, month, day] = date.split('-').map(Number)
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'Europe/Sarajevo',
  })
    .format(new Date(Date.UTC(year, month - 1, day, 12)))
    .toUpperCase()

  return hours.find((row) => row.weekday === weekday)
}

export function assistantShowOtherTime(closed: boolean): boolean {
  return !closed
}

export function assistantDateChange(nextDate: string): { preferredDate: string; preferredTime: string; otherTime: boolean } {
  return { preferredDate: nextDate, preferredTime: '', otherTime: false }
}

export function suggestPreferredTimes(input: {
  hoursForDay: AssistantDayHours | undefined
  busyLevel: BusyLevel
  date: string
  nowMinutes?: number
  today?: string
}): string[] {
  const hours = input.hoursForDay
  if (hours === undefined || hours.closed || hours.opensAt === null || hours.closesAt === null) {
    return []
  }

  const opens = minutes(hours.opensAt)
  const closes = minutes(hours.closesAt)
  const spans = openSpans(opens, closes, hours.breakStartsAt, hours.breakEndsAt)
  const total = spans.reduce((sum, [start, end]) => sum + (end - start), 0)
  if (total <= 0) {
    return []
  }

  const count = input.busyLevel === 'LOW' ? 3 : input.busyLevel === 'MEDIUM' ? 2 : 1
  const fractions = count === 3 ? [0.25, 0.5, 0.75] : count === 2 ? [1 / 3, 2 / 3] : [0.5]
  const marks = thirtyMinuteMarks(spans)
  const clocks: string[] = []
  for (const fraction of fractions) {
    const snapped = snapToMark(along(spans, fraction * total), marks)
    if (snapped !== null && !clocks.includes(snapped)) {
      clocks.push(snapped)
    }
  }

  const now = input.nowMinutes
  if (now !== undefined && input.today !== undefined && input.date === input.today) {
    return clocks.filter((clock) => minutes(clock) >= now)
  }

  return clocks
}

function minutes(hhmm: string): number {
  return Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function openSpans(
  opens: number,
  closes: number,
  breakStartsAt: string | null,
  breakEndsAt: string | null,
): [number, number][] {
  if (breakStartsAt === null || breakEndsAt === null) {
    return [[opens, closes]]
  }
  const breakStart = minutes(breakStartsAt)
  const breakEnd = minutes(breakEndsAt)
  if (breakStart <= opens || breakEnd >= closes || breakEnd <= breakStart) {
    return [[opens, closes]]
  }

  return [
    [opens, breakStart],
    [breakEnd, closes],
  ]
}

function thirtyMinuteMarks(spans: [number, number][]): number[] {
  const marks: number[] = []
  for (const [start, end] of spans) {
    const first = Math.ceil(start / 30) * 30
    for (let mark = first; mark < end; mark += 30) {
      marks.push(mark)
    }
  }

  return marks
}

function along(spans: [number, number][], distance: number): number {
  let remain = distance
  for (const [start, end] of spans) {
    const length = end - start
    if (remain <= length) {
      return start + remain
    }
    remain -= length
  }

  return spans[spans.length - 1][1]
}

function snapToMark(target: number, marks: number[]): string | null {
  if (marks.length === 0) {
    return null
  }
  let best = marks[0]
  let bestDist = Math.abs(marks[0] - target)
  for (const mark of marks) {
    const dist = Math.abs(mark - target)
    if (dist < bestDist || (dist === bestDist && mark > best)) {
      best = mark
      bestDist = dist
    }
  }

  return formatMinutes(best)
}
