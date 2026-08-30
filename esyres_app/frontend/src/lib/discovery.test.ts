import { expect, test } from 'vitest'
import { discoveryEmptyKey, discoveryHasFilter, discoverySource } from './discovery'

test('geo grant uses nearby', () => {
  expect(discoverySource('granted')).toBe('nearby')
})

test('geo deny or unavailable uses popular', () => {
  expect(discoverySource('denied')).toBe('popular')
  expect(discoverySource('unavailable')).toBe('popular')
})

test('unfiltered empty keeps source keys', () => {
  expect(discoveryEmptyKey('nearby', false)).toBe('discovery.emptyNearby')
  expect(discoveryEmptyKey('popular', false)).toBe('discovery.emptyPopular')
})

test('filtered empty uses Nema rezultata key', () => {
  expect(discoveryEmptyKey('nearby', true)).toBe('discovery.emptyFiltered')
  expect(discoveryEmptyKey('popular', true)).toBe('discovery.emptyFiltered')
})

test('filter is on when a chip or trimmed name is set', () => {
  expect(discoveryHasFilter(null, '')).toBe(false)
  expect(discoveryHasFilter(null, '  ')).toBe(false)
  expect(discoveryHasFilter('HAIR', '')).toBe(true)
  expect(discoveryHasFilter(null, 'Ana')).toBe(true)
})

test('geo grant uses nearby', () => {
  expect(discoverySource('granted')).toBe('nearby')
})

test('geo deny or unavailable uses popular', () => {
  expect(discoverySource('denied')).toBe('popular')
  expect(discoverySource('unavailable')).toBe('popular')
})
