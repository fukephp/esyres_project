import { expect, test } from 'vitest'
import { acceptErrorKey, canAcceptPreferredTime, isPreferredSoon, ownerDateFromSearch } from './owner'

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

test('Prihvati only when the request has a worker', () => {
  expect(canAcceptPreferredTime({ id: '1' })).toBe(true)
  expect(canAcceptPreferredTime(null)).toBe(false)
})

test('accept error keys', () => {
  expect(acceptErrorKey('SLOT_TAKEN')).toBe('SLOT_TAKEN')
  expect(acceptErrorKey('NOT_REQUESTED')).toBe('NOT_REQUESTED')
  expect(acceptErrorKey('WORKER_REQUIRED')).toBe('fallback')
  expect(acceptErrorKey(null)).toBe('fallback')
})
