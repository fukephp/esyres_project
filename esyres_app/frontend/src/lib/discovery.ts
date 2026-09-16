import { assistantAddressLine } from './assistant'

export type DiscoverySource = 'nearby' | 'popular'

export type DiscoveryListMode = 'teaser' | 'results'

export type ServiceCategory = 'HAIR' | 'MAKE_UP' | 'MASSAGE'

export const DISCOVERY_CATEGORIES: ServiceCategory[] = ['HAIR', 'MAKE_UP', 'MASSAGE']

export function discoverySource(geo: 'granted' | 'denied' | 'unavailable'): DiscoverySource {
  return geo === 'granted' ? 'nearby' : 'popular'
}

export function discoveryHasFilter(category: ServiceCategory | null, name: string): boolean {
  return category !== null || name.trim() !== ''
}

export function discoveryEmptyKey(
  source: DiscoverySource,
  filtered: boolean,
): 'discovery.emptyNearby' | 'discovery.emptyPopular' | 'discovery.emptyFiltered' {
  if (filtered) {
    return 'discovery.emptyFiltered'
  }
  return source === 'nearby' ? 'discovery.emptyNearby' : 'discovery.emptyPopular'
}

export function discoveryListMode(input: { filtered: boolean; showAll: boolean }): DiscoveryListMode {
  return input.filtered || input.showAll ? 'results' : 'teaser'
}

export function discoveryVisibleSalons<T>(salons: T[], mode: DiscoveryListMode): T[] {
  return mode === 'teaser' ? salons.slice(0, 3) : salons
}

export function discoveryShowAllVisible(listedCount: number, mode: DiscoveryListMode): boolean {
  return listedCount >= 4 && mode === 'teaser'
}

export function discoverySalonCategoryNames(
  categories: { name: string; services: { id: string }[] }[],
): string[] {
  return categories.filter((c) => c.services.length > 0).map((c) => c.name)
}

export function discoveryAddressLine(address: string | null | undefined): string | null {
  return assistantAddressLine(address)
}
