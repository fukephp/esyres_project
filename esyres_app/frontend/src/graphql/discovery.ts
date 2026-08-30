import { gql } from '@apollo/client'

export const SALONS_NEARBY_QUERY = gql`
  query SalonsNearby($lat: Float!, $lng: Float!) {
    salonsNearby(lat: $lat, lng: $lng) {
      id
      name
    }
  }
`

export const POPULAR_IN_SARAJEVO_QUERY = gql`
  query PopularInSarajevo {
    popularInSarajevo {
      id
      name
    }
  }
`

export type DiscoverySalon = {
  id: string
  name: string
}

export type SalonsNearbyData = {
  salonsNearby: DiscoverySalon[]
}

export type PopularInSarajevoData = {
  popularInSarajevo: DiscoverySalon[]
}
