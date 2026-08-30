export type DiscoverySource = 'nearby' | 'popular'

export function discoverySource(geo: 'granted' | 'denied' | 'unavailable'): DiscoverySource {
  return geo === 'granted' ? 'nearby' : 'popular'
}
