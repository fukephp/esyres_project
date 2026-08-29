import { expect, test } from 'vitest'
import { busyToken } from './busyToken'
import { formatFeninga } from './format'

test('formats feninga as KM via bs-BA', () => {
  const text = formatFeninga(2500)
  expect(text).toMatch(/25/)
  expect(text).not.toMatch(/2500/)
  expect(text.endsWith(' KM')).toBe(true)
})

test('maps busy enum to Design 2 tokens', () => {
  expect(busyToken('LOW')).toBe('busy-free')
  expect(busyToken('MEDIUM')).toBe('busy-moderate')
  expect(busyToken('HIGH')).toBe('busy-busy')
})
