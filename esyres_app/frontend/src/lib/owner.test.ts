import { expect, test } from 'vitest'
import {
  acceptErrorKey,
  canAcceptPreferredTime,
  canDropOnStart,
  cellKind,
  hoursForDate,
  isFifteenMinute,
  isPreferredSoon,
  occupyingBlock,
  ownerDateFromSearch,
  panelCells,
  proposeErrorKey,
  sarajevoWeekday,
} from './owner'

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

test('propose error keys', () => {
  expect(proposeErrorKey('OUTSIDE_HOURS')).toBe('OUTSIDE_HOURS')
  expect(proposeErrorKey('PAST_TIME')).toBe('PAST_TIME')
  expect(proposeErrorKey('INVALID_WORKER')).toBe('INVALID_WORKER')
  expect(proposeErrorKey('SLOT_TAKEN')).toBe('SLOT_TAKEN')
  expect(proposeErrorKey('nope')).toBe('fallback')
})

test('15-minute step', () => {
  expect(isFifteenMinute('14:00')).toBe(true)
  expect(isFifteenMinute('14:15')).toBe(true)
  expect(isFifteenMinute('14:07')).toBe(false)
  expect(isFifteenMinute('nope')).toBe(false)
})

test('grid window from hours', () => {
  expect(sarajevoWeekday('2026-08-29')).toBe('SATURDAY')
  expect(panelCells({ weekday: 'SUNDAY', closed: true, opensAt: null, closesAt: null, breakStartsAt: null, breakEndsAt: null })).toEqual([])
  const open = {
    weekday: 'SATURDAY',
    closed: false,
    opensAt: '09:00',
    closesAt: '10:00',
    breakStartsAt: '09:30',
    breakEndsAt: '09:45',
  }
  expect(panelCells(open).map((c) => `${c.time}:${c.off ? 'off' : 'on'}`)).toEqual([
    '09:00:on',
    '09:15:on',
    '09:30:off',
    '09:45:on',
  ])
  expect(hoursForDate([open], '2026-08-29')).toEqual(open)
})

test('start cell droppable only when free', () => {
  const blocks = [{ workerId: '1', start: '09:00', durationMinutes: 30, status: 'CONFIRMED' as const }]
  expect(canDropOnStart(cellKind('09:00', false, blocks, '1'))).toBe(false)
  expect(canDropOnStart(cellKind('09:15', false, blocks, '1'))).toBe(false)
  expect(canDropOnStart(cellKind('09:30', false, blocks, '1'))).toBe(true)
  expect(canDropOnStart(cellKind('09:00', true, [], '1'))).toBe(false)
  expect(canDropOnStart(cellKind('09:00', false, blocks, '2'))).toBe(true)
  expect(cellKind('09:00', false, [{ ...blocks[0], status: 'TIME_PROPOSED' }], '1')).toBe('proposed')
})

test('occupying block uses proposed fields for time proposed', () => {
  expect(
    occupyingBlock({
      status: 'TIME_PROPOSED',
      preferredStartsAt: '2026-08-29T09:00:00.000Z',
      proposedStartsAt: '2026-08-29T12:00:00.000Z',
      durationMinutes: 30,
      worker: { id: 'a' },
      proposedWorker: { id: 'b' },
    }),
  ).toEqual({
    workerId: 'b',
    start: '14:00',
    durationMinutes: 30,
    status: 'TIME_PROPOSED',
  })
})
