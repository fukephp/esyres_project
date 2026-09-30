export function formatFeninga(feninga: number): string {
  const amount = new Intl.NumberFormat('bs-BA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(feninga / 100)

  return `${amount} KM`
}

export function sarajevoToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sarajevo',
  }).format(new Date())
}

const SARAJEVO_CLOCK: Intl.DateTimeFormatOptions = {
  timeZone: 'Europe/Sarajevo',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}

function sarajevoHourMinute(date: Date): [string, string] {
  const parts = new Intl.DateTimeFormat('bs-BA', SARAJEVO_CLOCK).formatToParts(date)
  const hour = (parts.find((part) => part.type === 'hour')?.value ?? '00').padStart(2, '0')
  const minute = (parts.find((part) => part.type === 'minute')?.value ?? '00').padStart(2, '0')

  return [hour === '24' ? '00' : hour, minute]
}

export function formatSarajevoTime(iso: string): string {
  const [hour, minute] = sarajevoHourMinute(new Date(iso))

  return `${hour}:${minute}`
}

export function formatSarajevoDateTime(iso: string): string {
  const date = new Intl.DateTimeFormat('bs-BA', {
    timeZone: 'Europe/Sarajevo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))

  return `${date} ${formatSarajevoTime(iso)}`
}

export function formatCivilDate(ymd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (match === null) {
    return ymd
  }

  return new Intl.DateTimeFormat('bs-BA', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)))
}

export function sarajevoNowMinutes(now = new Date()): number {
  const [hour, minute] = sarajevoHourMinute(now)

  return Number(hour) * 60 + Number(minute)
}
