import { gql } from '@apollo/client'

export const OWNER_BOOKING_QUERY = gql`
  query OwnerBooking($id: ID!) {
    ownerBooking(id: $id) {
      id
      status
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
      salon {
        id
        name
      }
    }
  }
`

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

export const PROPOSE_TIME_MUTATION = gql`
  mutation ProposeTime($bookingId: ID!, $workerId: ID!, $proposedTime: String!) {
    proposeTime(bookingId: $bookingId, workerId: $workerId, proposedTime: $proposedTime) {
      id
      status
    }
  }
`

export const DECLINE_BOOKING_MUTATION = gql`
  mutation DeclineBooking($bookingId: ID!, $reason: String) {
    declineBooking(bookingId: $bookingId, reason: $reason) {
      id
      status
      declineReason
    }
  }
`

export const OWNER_SALON_QUERY = gql`
  query OwnerSalon($id: ID!) {
    salon(id: $id) {
      id
      workers {
        id
        name
      }
      hours {
        weekday
        closed
        opensAt
        closesAt
        breakStartsAt
        breakEndsAt
      }
    }
  }
`

export const OCCUPYING_BOOKINGS_QUERY = gql`
  query OccupyingBookings($salonId: ID!, $date: String!) {
    occupyingBookings(salonId: $salonId, date: $date) {
      id
      status
      preferredStartsAt
      proposedStartsAt
      durationMinutes
      worker {
        id
        name
      }
      proposedWorker {
        id
        name
      }
    }
  }
`

export const BOOKING_CUSTOMER_RESPONDED_SUBSCRIPTION = gql`
  subscription BookingCustomerResponded($salonId: ID!) {
    bookingCustomerResponded(salonId: $salonId) {
      id
      status
    }
  }
`

export type OwnerBooking = {
  id: string
  status: 'REQUESTED' | 'CONFIRMED' | 'TIME_PROPOSED' | 'DECLINED'
  customerName: string
  preferredDate: string
  preferredStartsAt: string
  durationMinutes: number
  worker: { id: string; name: string } | null
  services: { name: string; durationMinutes: number }[]
  salon: { id: string; name: string }
}

export type OwnerBookingData = {
  ownerBooking: OwnerBooking
}

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

export type OccupyingBooking = {
  id: string
  status: 'CONFIRMED' | 'TIME_PROPOSED'
  preferredStartsAt: string
  proposedStartsAt: string | null
  durationMinutes: number
  worker: { id: string; name: string } | null
  proposedWorker: { id: string; name: string } | null
}

export type OccupyingBookingsData = {
  occupyingBookings: OccupyingBooking[]
}

export type OwnerSalonData = {
  salon: {
    id: string
    workers: { id: string; name: string }[]
    hours: {
      weekday: string
      closed: boolean
      opensAt: string | null
      closesAt: string | null
      breakStartsAt: string | null
      breakEndsAt: string | null
    }[]
  } | null
}
