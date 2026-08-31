import { expect, test } from 'vitest'
import { isPreferredSoon, ownerDateFromSearch } from './owner'

test('omit or invalid date falls back to Sarajevo today', () => {
  expect(ownerDateFromSearch(null, '2026-08-29')).toBe('2026-08-29')
  expect(ownerDateFromSearch('nope', '2026-08-29')).toBe('2026-08-29')
  expect(ownerDateFromSearch('2026-02-31', '2026-08-29')).toBe('2026-08-29')
  expect(ownerDateFromSearch('2026-08-31', '2026-08-29')).toBe('2026-08-31')
})

test('preferred time is soon when past or within two hours', () => {
  const now = new Date('2026-08-29T07:00:00.000Z')
  expect(isPreferredSoon('2026-08-29T09:00:00.000Z', now)).toBe(true)
  expect(isPreferredSoon('2026-08-29T06:00:00.000Z', now)).toBe(true)
  expect(isPreferredSoon('2026-08-29T09:00:01.000Z', now)).toBe(false)
})
