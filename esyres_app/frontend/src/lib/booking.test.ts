import { expect, test } from 'vitest'
import { graphqlErrorCode, stackSelection, bookingWorkerId } from './booking'

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
