import { gql } from '@apollo/client'

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      emailVerified
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      email
      emailVerified
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $phone: String) {
    register(email: $email, password: $password, phone: $phone) {
      id
      email
      emailVerified
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

export type MeData = {
  me: { id: string; email: string; emailVerified: boolean } | null
}
