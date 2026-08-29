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
