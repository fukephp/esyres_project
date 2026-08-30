export type DiscoverySource = 'nearby' | 'popular'

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
