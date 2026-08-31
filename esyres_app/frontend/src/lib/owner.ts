import { sarajevoToday } from './format'

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

export function formatSarajevoTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Sarajevo',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso))
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
