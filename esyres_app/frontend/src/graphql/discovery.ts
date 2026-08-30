import { gql } from '@apollo/client'
import type { ServiceCategory } from '../lib/discovery'

export const SALONS_NEARBY_QUERY = gql`
  query SalonsNearby($lat: Float!, $lng: Float!, $category: ServiceCategory, $name: String) {
    salonsNearby(lat: $lat, lng: $lng, category: $category, name: $name) {
      id
      name
    }
  }
`

export const POPULAR_IN_SARAJEVO_QUERY = gql`
  query PopularInSarajevo($category: ServiceCategory, $name: String) {
    popularInSarajevo(category: $category, name: $name) {
      id
      name
    }
  }
`

export type DiscoverySalon = {
  id: string
  name: string
}

export type DiscoveryVars = {
  category?: ServiceCategory
  name?: string
}

export type SalonsNearbyData = {
  salonsNearby: DiscoverySalon[]
}

export type PopularInSarajevoData = {
  popularInSarajevo: DiscoverySalon[]
}
