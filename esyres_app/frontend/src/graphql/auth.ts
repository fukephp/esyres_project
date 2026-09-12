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
    salons: { id: string; name: string }[]
  } | null
}
