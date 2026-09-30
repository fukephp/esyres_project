import { expect, test } from 'vitest'
import { busyToken } from './busyToken'
import { formatCivilDate, formatFeninga, formatSarajevoDateTime, formatSarajevoTime } from './format'

test('formats feninga as KM via bs-BA', () => {
  const text = formatFeninga(2500)
  expect(text).toMatch(/25/)
  expect(text).not.toMatch(/2500/)
  expect(text.endsWith(' KM')).toBe(true)
})

test('sarajevo clock is 24h with no meridiem', () => {
  expect(formatSarajevoTime('2026-10-01T00:30:00.000Z')).toBe('02:30')
  expect(formatSarajevoTime('2026-10-01T12:30:00.000Z')).toBe('14:30')
  expect(formatSarajevoTime('2026-10-01T22:00:00.000Z')).toBe('00:00')
  expect(formatSarajevoDateTime('2026-10-01T00:30:00.000Z')).toBe('01. 10. 2026. 02:30')
  expect(formatSarajevoDateTime('2026-10-01T12:30:00.000Z')).not.toMatch(/PM|AM|pm|am/)
  expect(formatCivilDate('2026-10-01')).toBe('01. 10. 2026.')
})

test('maps busy enum to Design 2 tokens', () => {
  expect(busyToken('LOW')).toBe('busy-free')
  expect(busyToken('MEDIUM')).toBe('busy-moderate')
  expect(busyToken('HIGH')).toBe('busy-busy')
})
