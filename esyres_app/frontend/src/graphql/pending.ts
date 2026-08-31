import { gql } from '@apollo/client'

export const PENDING_BOOKINGS_QUERY = gql`
  query PendingBookings($salonId: ID!, $date: String!) {
    pendingBookings(salonId: $salonId, date: $date) {
      id
      customerName
      preferredDate
      preferredStartsAt
      durationMinutes
      worker {
        id
        name
      }
      services {
        name
        durationMinutes
      }
    }
  }
`

export const ACCEPT_PREFERRED_TIME_MUTATION = gql`
  mutation AcceptPreferredTime($bookingId: ID!) {
    acceptPreferredTime(bookingId: $bookingId) {
      id
      status
    }
  }
`

export type PendingBooking = {
  id: string
  customerName: string
  preferredDate: string
  preferredStartsAt: string
  durationMinutes: number
  worker: { id: string; name: string } | null
  services: { name: string; durationMinutes: number }[]
}

export type PendingBookingsData = {
  pendingBookings: PendingBooking[]
}
