import { expect, test } from 'vitest'
import i18n from '../i18n'
import { keepQuarterStart, quarterNoneTappable, quarterStartPast } from './guestQuarter'

const rows = [
  { time: '09:00', booked: false },
  { time: '10:00', booked: true },
  { time: '11:00', booked: false },
]

test('a start earlier today is past, including the current minute once seconds have moved', () => {
  const now = new Date('2026-08-31T08:00:30.000Z')
  expect(quarterStartPast('2026-08-31', '09:00', '2026-08-31', now)).toBe(true)
  expect(quarterStartPast('2026-08-31', '10:00', '2026-08-31', now)).toBe(true)
  expect(quarterStartPast('2026-08-31', '10:15', '2026-08-31', now)).toBe(false)
  expect(quarterStartPast('2026-09-01', '09:00', '2026-08-31', now)).toBe(false)
})

test('keep a start only while the new list still offers it as tappable', () => {
  const past = (time: string) => time === '09:00'
  expect(keepQuarterStart('11:00', rows, past)).toBe('11:00')
  expect(keepQuarterStart('10:00', rows, past)).toBe('')
  expect(keepQuarterStart('09:00', rows, past)).toBe('')
  expect(keepQuarterStart('12:00', rows, past)).toBe('')
})

test('nothing tappable when every row is booked or past', () => {
  const past = (time: string) => time === '09:00' || time === '11:00'
  expect(quarterNoneTappable(rows, past)).toBe(true)
  expect(quarterNoneTappable(rows, () => false)).toBe(false)
  expect(quarterNoneTappable([], () => false)).toBe(true)
})

test('guest quarter copy', () => {
  expect(i18n.t('salon.quarter.booked')).toBe('Zauzet')
  expect(i18n.t('salon.quarter.none')).toBe('Nema slobodnog termina.')
  expect(i18n.t('salon.quarter.dayOnly')).toBe('Možeš poslati i bez vremena.')
  expect(i18n.t('salon.gate.SLOT_TAKEN')).toBe('Taj termin je zauzet.')
  expect(i18n.t('salon.gate.OUTSIDE_HOURS')).toBe('Van radnog vremena.')
  expect(i18n.t('salon.gate.DURING_BREAK')).toBe('Termin pada u pauzu.')
  expect(i18n.t('salon.gate.INVALID_TIME_STEP')).toBe('Neispravan datum ili vrijeme.')
})
