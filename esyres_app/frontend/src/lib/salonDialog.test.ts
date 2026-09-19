import { expect, test } from 'vitest'
import { dialogCancelShouldClose } from './salonDialog'

test('dialogCancelShouldClose is false only for native date and time', () => {
  expect(dialogCancelShouldClose('date')).toBe(false)
  expect(dialogCancelShouldClose('time')).toBe(false)
  expect(dialogCancelShouldClose(null)).toBe(true)
  expect(dialogCancelShouldClose('')).toBe(true)
  expect(dialogCancelShouldClose('text')).toBe(true)
  expect(dialogCancelShouldClose('radio')).toBe(true)
})
