import { expect, test } from 'vitest'
import {
  bookingClock,
  bookingStatusKey,
  bookingWorkerId,
  graphqlErrorCode,
  respondErrorKey,
  stackSelection,
} from './booking'

test('stacks duration and feninga', () => {
  expect(
    stackSelection([
      { durationMinutes: 30, priceFeninga: 2500 },
      { durationMinutes: 45, priceFeninga: 4000 },
    ]),
  ).toEqual({ durationMinutes: 75, priceFeninga: 6500 })
})

test('empty selection is zero', () => {
  expect(stackSelection([])).toEqual({ durationMinutes: 0, priceFeninga: 0 })
})

test('reads GraphQL error code', () => {
  expect(graphqlErrorCode({ graphQLErrors: [{ extensions: { code: 'UNAUTHENTICATED' } }] })).toBe(
    'UNAUTHENTICATED',
  )
  expect(graphqlErrorCode(new Error('nope'))).toBeNull()
})

test('omits workerId for no preference', () => {
  expect(bookingWorkerId('')).toBeUndefined()
  expect(bookingWorkerId('12')).toBe('12')
})

const worker = { id: '1', name: 'Lejla' }

test('TIME_PROPOSED clock uses proposed start and worker', () => {
  expect(
    bookingClock({
      status: 'TIME_PROPOSED',
      preferredStartsAt: '2026-08-29T09:00:00.000Z',
      worker: null,
      proposedStartsAt: '2026-08-30T12:00:00.000Z',
      proposedWorker: worker,
    }),
  ).toEqual({ startsAt: '2026-08-30T12:00:00.000Z', worker })
})

test('other statuses use preferred start and worker', () => {
  expect(
    bookingClock({
      status: 'REQUESTED',
      preferredStartsAt: '2026-08-29T09:00:00.000Z',
      worker,
      proposedStartsAt: '2026-08-30T12:00:00.000Z',
      proposedWorker: worker,
    }),
  ).toEqual({ startsAt: '2026-08-29T09:00:00.000Z', worker })
  expect(
    bookingClock({
      status: 'CONFIRMED',
      preferredStartsAt: '2026-08-29T09:00:00.000Z',
      worker,
      proposedStartsAt: null,
      proposedWorker: null,
    }),
  ).toEqual({ startsAt: '2026-08-29T09:00:00.000Z', worker })
  expect(
    bookingClock({
      status: 'DECLINED',
      preferredStartsAt: '2026-08-29T09:00:00.000Z',
      worker: null,
      proposedStartsAt: null,
      proposedWorker: null,
    }),
  ).toEqual({ startsAt: '2026-08-29T09:00:00.000Z', worker: null })
})

test('status maps to i18n keys', () => {
  expect(bookingStatusKey('REQUESTED')).toBe('REQUESTED')
  expect(bookingStatusKey('TIME_PROPOSED')).toBe('TIME_PROPOSED')
  expect(bookingStatusKey('CONFIRMED')).toBe('CONFIRMED')
  expect(bookingStatusKey('DECLINED')).toBe('DECLINED')
  expect(bookingStatusKey('nope')).toBe('REQUESTED')
})

test('respondErrorKey maps known codes', () => {
  expect(respondErrorKey('NOT_TIME_PROPOSED')).toBe('NOT_TIME_PROPOSED')
  expect(respondErrorKey('EMAIL_UNVERIFIED')).toBe('EMAIL_UNVERIFIED')
  expect(respondErrorKey('PHONE_UNVERIFIED')).toBe('PHONE_UNVERIFIED')
  expect(respondErrorKey('SALON_CLOSED')).toBe('SALON_CLOSED')
  expect(respondErrorKey('PAST_TIME')).toBe('PAST_TIME')
  expect(respondErrorKey('INVALID_DATE')).toBe('INVALID_DATE')
  expect(respondErrorKey('INVALID_TIME')).toBe('INVALID_TIME')
  expect(respondErrorKey('FORBIDDEN')).toBe('FORBIDDEN')
  expect(respondErrorKey('SLOT_TAKEN')).toBe('SLOT_TAKEN')
  expect(respondErrorKey('NOT_REQUESTED')).toBe('fallback')
  expect(respondErrorKey(null)).toBe('fallback')
})
