import { gql } from '@apollo/client'

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      emailVerified
      phone
      phoneVerified
      salons {
        id
        name
        address
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
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      name
      email
      emailVerified
      phone
      phoneVerified
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $phone: String) {
    register(name: $name, email: $email, password: $password, phone: $phone) {
      id
      name
      email
      emailVerified
      phone
      phoneVerified
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

export const CREATE_SALON_MUTATION = gql`
  mutation CreateSalon($name: String!) {
    createSalon(name: $name) {
      id
      name
    }
  }
`

export const UPDATE_SALON_MUTATION = gql`
  mutation UpdateSalon($salonId: ID!, $input: UpdateSalonInput!) {
    updateSalon(salonId: $salonId, input: $input) {
      id
      name
      address
    }
  }
`

export const ADD_SALON_MUTATION = gql`
  mutation AddSalon($name: String!, $address: String!) {
    addSalon(name: $name, address: $address) {
      id
      name
      address
    }
  }
`

export const RESEND_VERIFICATION_EMAIL = gql`
  mutation ResendVerificationEmail {
    resendVerificationEmail
  }
`

export const REQUEST_PHONE_OTP = gql`
  mutation RequestPhoneOtp($phone: String!) {
    requestPhoneOtp(phone: $phone)
  }
`

export const VERIFY_PHONE_OTP = gql`
  mutation VerifyPhoneOtp($code: String!) {
    verifyPhoneOtp(code: $code)
  }
`

export type MeData = {
  me: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    phone: string | null
    phoneVerified: boolean
    salons: {
      id: string
      name: string
      address: string | null
      hours: {
        weekday: string
        closed: boolean
        opensAt: string | null
        closesAt: string | null
        breakStartsAt: string | null
        breakEndsAt: string | null
      }[]
    }[]
  } | null
}
