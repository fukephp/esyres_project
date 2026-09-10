import { gql } from '@apollo/client'

export const SALON_STATS_QUERY = gql`
  query SalonStats($salonId: ID!) {
    salonStats(salonId: $salonId) {
      fromDate
      toDate
      bookingsCount
      cancellationRatePercent
      lateCancels
      days {
        date
        weekday
        bookingsCount
        busyPercent
      }
      hours {
        hour
        bookingsCount
      }
    }
  }
`

export type SalonStatsDay = {
  date: string
  weekday: string
  bookingsCount: number
  busyPercent: number
}

export type SalonStatsHour = {
  hour: number
  bookingsCount: number
}

export type SalonStats = {
  fromDate: string
  toDate: string
  bookingsCount: number
  cancellationRatePercent: number
  lateCancels: number
  days: SalonStatsDay[]
  hours: SalonStatsHour[]
}

export type SalonStatsData = {
  salonStats: SalonStats
}
