import { gql } from '@apollo/client'

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      email
      emailVerified
    }
  }
`

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
  preferredDate: string
  preferredTime: string
}
