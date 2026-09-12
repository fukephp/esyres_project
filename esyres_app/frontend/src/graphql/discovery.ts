import { gql } from '@apollo/client'
import type { BusyLevel } from '../lib/busyToken'
import type { ServiceCategory } from '../lib/discovery'

export const SALONS_NEARBY_QUERY = gql`
  query SalonsNearby($lat: Float!, $lng: Float!, $date: String!, $category: ServiceCategory, $name: String) {
    salonsNearby(lat: $lat, lng: $lng, category: $category, name: $name) {
      id
      name
      address
      busyLevel(date: $date)
      services {
        category
      }
    }
  }
`

export const POPULAR_IN_SARAJEVO_QUERY = gql`
  query PopularInSarajevo($date: String!, $category: ServiceCategory, $name: String) {
    popularInSarajevo(category: $category, name: $name) {
      id
      name
      address
      busyLevel(date: $date)
      services {
        category
      }
    }
  }
`

export type DiscoverySalon = {
  id: string
  name: string
  address: string | null
  busyLevel: BusyLevel
  services: { category: ServiceCategory }[]
}

export type DiscoveryVars = {
  date: string
  category?: ServiceCategory
  name?: string
}

export type SalonsNearbyData = {
  salonsNearby: DiscoverySalon[]
}

export type PopularInSarajevoData = {
  popularInSarajevo: DiscoverySalon[]
}
