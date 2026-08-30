import { gql } from '@apollo/client'

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      emailVerified
      phone
      phoneVerified
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      email
      emailVerified
      phone
      phoneVerified
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $phone: String) {
    register(email: $email, password: $password, phone: $phone) {
      id
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
    email: string
    emailVerified: boolean
    phone: string | null
    phoneVerified: boolean
  } | null
}
