import { expect, test } from 'vitest'
import { POPULAR_IN_SARAJEVO_QUERY, SALONS_NEARBY_QUERY } from '../graphql/discovery'
import {
  discoveryAddressLine,
  discoveryEmptyKey,
  discoveryHasFilter,
  discoveryListMode,
  discoverySalonCategories,
  discoveryShowAllVisible,
  discoverySource,
  discoveryVisibleSalons,
} from './discovery'

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

test('list mode is teaser only when unfiltered and not show-all', () => {
  expect(discoveryListMode({ filtered: false, showAll: false })).toBe('teaser')
  expect(discoveryListMode({ filtered: true, showAll: false })).toBe('results')
  expect(discoveryListMode({ filtered: false, showAll: true })).toBe('results')
  expect(discoveryListMode({ filtered: true, showAll: true })).toBe('results')
})

test('teaser slices first 3; results keep the page', () => {
  const salons = [1, 2, 3, 4, 5]
  expect(discoveryVisibleSalons(salons, 'teaser')).toEqual([1, 2, 3])
  expect(discoveryVisibleSalons(salons, 'results')).toEqual(salons)
  expect(discoveryVisibleSalons([1, 2], 'teaser')).toEqual([1, 2])
})

test('show all is only on teaser with 4+ listed', () => {
  expect(discoveryShowAllVisible(0, 'teaser')).toBe(false)
  expect(discoveryShowAllVisible(3, 'teaser')).toBe(false)
  expect(discoveryShowAllVisible(4, 'teaser')).toBe(true)
  expect(discoveryShowAllVisible(4, 'results')).toBe(false)
})

test('categories are unique in chip order; unknown omitted', () => {
  expect(
    discoverySalonCategories([
      { category: 'MAKE_UP' },
      { category: 'HAIR' },
      { category: 'HAIR' },
      { category: 'MASSAGE' },
    ]),
  ).toEqual(['HAIR', 'MAKE_UP', 'MASSAGE'])
  expect(discoverySalonCategories([{ category: 'HAIR' }, { category: 'OTHER' }])).toEqual(['HAIR'])
  expect(discoverySalonCategories([])).toEqual([])
})

test('address line reuses assistant omit rules', () => {
  expect(discoveryAddressLine(null)).toBeNull()
  expect(discoveryAddressLine(undefined)).toBeNull()
  expect(discoveryAddressLine('')).toBeNull()
  expect(discoveryAddressLine('   ')).toBeNull()
  expect(discoveryAddressLine('Ferhadija 12')).toBe('Ferhadija 12')
  expect(discoveryAddressLine('  Ferhadija 12  ')).toBe('Ferhadija 12')
})

test('discovery copy is Bosnian; heading is never Rezultati', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('discovery.nearby')).toBe('Saloni u blizini')
  expect(i18n.t('discovery.popular')).toBe('Popularno u Sarajevu')
  expect(i18n.t('discovery.emptyNearby')).toBe('Nema salona u blizini.')
  expect(i18n.t('discovery.emptyPopular')).toBe('Nema salona.')
  expect(i18n.t('discovery.emptyFiltered')).toBe('Nema rezultata.')
  expect(i18n.t('discovery.searchPlaceholder')).toBe('Ime salona')
  expect(i18n.t('discovery.showAll')).toBe('Prikaži sve')
  expect(i18n.exists('discovery.results')).toBe(false)
  expect(i18n.t('category.HAIR')).toBe('Kosa')
  expect(i18n.t('category.MAKE_UP')).toBe('Šminka')
  expect(i18n.t('category.MASSAGE')).toBe('Masaža')
  expect(i18n.t('salon.busy.LOW')).toBe('Slobodnije')
  expect(i18n.t('salon.busy.MEDIUM')).toBe('Umjereno')
  expect(i18n.t('salon.busy.HIGH')).toBe('Zauzeto')
})

test('list queries ask for richer facts with a date', () => {
  const nearby = SALONS_NEARBY_QUERY.loc?.source.body ?? ''
  const popular = POPULAR_IN_SARAJEVO_QUERY.loc?.source.body ?? ''
  for (const body of [nearby, popular]) {
    expect(body).toContain('$date')
    expect(body).toContain('address')
    expect(body).toContain('busyLevel(date: $date)')
    expect(body).toContain('services')
    expect(body).toContain('category')
    expect(body).not.toContain('searchSalons')
  }
})
