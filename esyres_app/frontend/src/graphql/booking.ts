import { gql } from '@apollo/client'

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      preferredDate
      preferredStartsAt
      durationMinutes
      services {
        name
        durationMinutes
        priceFeninga
      }
    }
  }
`

export const MY_BOOKINGS_QUERY = gql`
  query MyBookings {
    myBookings {
      id
      status
      preferredDate
      preferredStartsAt
      durationMinutes
      worker {
        id
        name
      }
      proposedStartsAt
      proposedWorker {
        id
        name
      }
      declineReason
      salon {
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

export type CreateBookingInput = {
  salonId: string
  serviceIds: string[]
  workerId?: string
  preferredDate: string
  preferredTime: string
}

export type MyBooking = {
  id: string
  status: 'REQUESTED' | 'TIME_PROPOSED' | 'CONFIRMED' | 'DECLINED'
  preferredDate: string
  preferredStartsAt: string
  durationMinutes: number
  worker: { id: string; name: string } | null
  proposedStartsAt: string | null
  proposedWorker: { id: string; name: string } | null
  declineReason: string | null
  salon: { id: string; name: string }
  services: { name: string; durationMinutes: number }[]
}

export type MyBookingsData = {
  myBookings: MyBooking[]
}
