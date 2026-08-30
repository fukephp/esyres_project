import { expect, test } from 'vitest'
import { discoverySource } from './discovery'

test('geo grant uses nearby', () => {
  expect(discoverySource('granted')).toBe('nearby')
})

test('geo deny or unavailable uses popular', () => {
  expect(discoverySource('denied')).toBe('popular')
  expect(discoverySource('unavailable')).toBe('popular')
})
