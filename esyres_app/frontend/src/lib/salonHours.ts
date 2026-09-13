import { assistantHoursFacts, type AssistantDayHours, type ProfileMode } from './assistant'

export type HoursTapResult =
  | { noop: true }
  | { mode: 'picker'; preferredDate: string; preferredTime: string; scroll: true }

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

export function hoursRowTappable(input: {
  closed: boolean
  hasServices: boolean
  mode: ProfileMode
}): boolean {
  if (input.closed || !input.hasServices) {
    return false
  }

  return input.mode === 'idle' || input.mode === 'picker' || input.mode === 'chat'
}

export function hoursRowSelected(input: {
  tappable: boolean
  rowWeekday: string
  preferredDate: string
}): boolean {
  if (!input.tappable || input.preferredDate === '') {
    return false
  }

  return sarajevoWeekdayFromYmd(input.preferredDate) === input.rowWeekday
}

export function applyHoursRowTap(input: {
  tappable: boolean
  selected: boolean
  weekday: string
  today: string
  preferredTime: string
}): HoursTapResult {
  if (!input.tappable || input.selected) {
    return { noop: true }
  }

  return {
    mode: 'picker',
    preferredDate: nextSarajevoDateForWeekday(input.weekday, input.today),
    preferredTime: input.preferredTime,
    scroll: true,
  }
}
