export type QuarterStart = {
  time: string
  booked: boolean
}

export function quarterStartPast(date: string, time: string, today: string, now: Date): boolean {
  if (date !== today) {
    return false
  }
  const [hour, minute] = time.split(':').map(Number)
  const start = hour * 60 + minute
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Sarajevo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const nowHour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const nowMinute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0')
  const nowSecond = Number(parts.find((part) => part.type === 'second')?.value ?? '0')
  const nowMinutes = nowHour * 60 + nowMinute
  if (start < nowMinutes) {
    return true
  }
  if (start > nowMinutes) {
    return false
  }

  return nowSecond > 0
}

export function keepQuarterStart(
  selected: string,
  rows: QuarterStart[],
  past: (time: string) => boolean,
): string {
  const row = rows.find((item) => item.time === selected)
  if (row === undefined || row.booked || past(row.time)) {
    return ''
  }

  return selected
}

export function quarterNoneTappable(rows: QuarterStart[], past: (time: string) => boolean): boolean {
  return rows.every((row) => row.booked || past(row.time))
}
