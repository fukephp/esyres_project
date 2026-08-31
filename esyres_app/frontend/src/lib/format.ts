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

export function formatSarajevoTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Sarajevo',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso))
}

export function formatSarajevoDateTime(iso: string): string {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sarajevo',
  }).format(new Date(iso))

  return `${date} ${formatSarajevoTime(iso)}`
}
