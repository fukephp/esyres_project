import { gql } from '@apollo/client'

export const SALON_QR_STATS_QUERY = gql`
  query SalonQrStats($salonId: ID!) {
    salonQrStats(salonId: $salonId) {
      scanCount
      visitCount
      conversionPercent
    }
  }
`

export type SalonQrStats = {
  scanCount: number
  visitCount: number
  conversionPercent: number
}

export type SalonQrStatsData = {
  salonQrStats: SalonQrStats
}
