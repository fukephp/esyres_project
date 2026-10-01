import { assistantHoursFacts, type AssistantDayHours } from './assistant'

export type GuestDayChip = 'today' | 'tomorrow' | 'other'

export function sarajevoWeekdayFromYmd(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'Europe/Sarajevo',
  })
    .format(new Date(Date.UTC(year, month - 1, day, 12)))
    .toUpperCase()
}

export function nextSarajevoDateForWeekday(weekday: string, today: string): string {
  const [year, month, day] = today.split('-').map(Number)
  const start = Date.UTC(year, month - 1, day, 12)

  for (let offset = 0; offset < 7; offset += 1) {
    const next = new Date(start + offset * 24 * 60 * 60 * 1000)
    const ymd = [
      next.getUTCFullYear(),
      String(next.getUTCMonth() + 1).padStart(2, '0'),
      String(next.getUTCDate()).padStart(2, '0'),
    ].join('-')
    if (sarajevoWeekdayFromYmd(ymd) === weekday) {
      return ymd
    }
  }

  return today
}

export function hoursRowClosed(day: AssistantDayHours | undefined): boolean {
  const facts = assistantHoursFacts(day)
  return facts === null || facts.closed
}

function shiftYmd(ymd: string, deltaDays: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day, 12))
  next.setUTCDate(next.getUTCDate() + deltaDays)

  return [
    next.getUTCFullYear(),
    String(next.getUTCMonth() + 1).padStart(2, '0'),
    String(next.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

function clockMinutes(hhmm: string): number {
  const [hour, minute] = hhmm.split(':').map(Number)

  return hour * 60 + minute
}

export function hoursHaveOpenQuarter(day: AssistantDayHours | undefined): boolean {
  if (day === undefined || day.closed || day.opensAt === null || day.closesAt === null) {
    return false
  }
  const open = clockMinutes(day.opensAt)
  const close = clockMinutes(day.closesAt)
  const onBreak =
    day.breakStartsAt !== null && day.breakEndsAt !== null
      ? { start: clockMinutes(day.breakStartsAt), end: clockMinutes(day.breakEndsAt) }
      : null
  for (let total = 0; total < 24 * 60; total += 15) {
    if (total < open || total >= close) {
      continue
    }
    if (onBreak !== null && total >= onBreak.start && total < onBreak.end) {
      continue
    }

    return true
  }

  return false
}

export function guestHoursSkip(today: string, hours: AssistantDayHours[]): { chip: GuestDayChip; date: string } {
  for (let offset = 0; offset < 7; offset += 1) {
    const date = shiftYmd(today, offset)
    const day = hours.find((row) => row.weekday === sarajevoWeekdayFromYmd(date))
    if (!hoursHaveOpenQuarter(day)) {
      continue
    }
    if (offset === 0) {
      return { chip: 'today', date }
    }
    if (offset === 1) {
      return { chip: 'tomorrow', date }
    }

    return { chip: 'other', date: '' }
  }

  return { chip: 'today', date: today }
}

export function guestDayChange(
  today: string,
  action: { chip: GuestDayChip } | { date: string },
): { chip: GuestDayChip; date: string; time: string; workerId: string } {
  const tomorrow = shiftYmd(today, 1)
  if ('chip' in action) {
    if (action.chip === 'today') {
      return { chip: 'today', date: today, time: '', workerId: '' }
    }
    if (action.chip === 'tomorrow') {
      return { chip: 'tomorrow', date: tomorrow, time: '', workerId: '' }
    }

    return { chip: 'other', date: '', time: '', workerId: '' }
  }
  if (action.date === today) {
    return { chip: 'today', date: today, time: '', workerId: '' }
  }
  if (action.date === tomorrow) {
    return { chip: 'tomorrow', date: tomorrow, time: '', workerId: '' }
  }

  return { chip: 'other', date: action.date, time: '', workerId: '' }
}

export function guestAfterServiceChange(time: string, tappable: string[]): string {
  return tappable.includes(time) ? time : ''
}

export function formatPickerDayNumeric(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number)

  return `${day}. ${month}. ${year}`
}
