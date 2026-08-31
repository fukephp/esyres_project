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

export type CreateBookingInput = {
  salonId: string
  serviceIds: string[]
  workerId?: string
  preferredDate: string
  preferredTime: string
}
