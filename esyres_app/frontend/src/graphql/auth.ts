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
        description
        mainImageUrl
        galleryUrls
        cancellationNoticeHours
        hours {
          weekday
          closed
          opensAt
          closesAt
          breakStartsAt
          breakEndsAt
        }
        serviceCategories {
          id
          name
          services {
            id
            name
            durationMinutes
            priceFeninga
          }
        }
        services {
          id
          name
          durationMinutes
          priceFeninga
        }
        workers {
          id
          name
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
      description
      mainImageUrl
      galleryUrls
    }
  }
`

export const UPLOAD_SALON_MAIN_IMAGE_MUTATION = `mutation UploadSalonMainImage($salonId: ID!, $file: Upload!) {
  uploadSalonMainImage(salonId: $salonId, file: $file) {
    id
    description
    mainImageUrl
    galleryUrls
  }
}`

export const REMOVE_SALON_MAIN_IMAGE_MUTATION = gql`
  mutation RemoveSalonMainImage($salonId: ID!) {
    removeSalonMainImage(salonId: $salonId) {
      id
      mainImageUrl
      galleryUrls
    }
  }
`

export const UPLOAD_SALON_GALLERY_IMAGE_MUTATION = `mutation UploadSalonGalleryImage($salonId: ID!, $file: Upload!) {
  uploadSalonGalleryImage(salonId: $salonId, file: $file) {
    id
    description
    mainImageUrl
    galleryUrls
  }
}`

export const REMOVE_SALON_GALLERY_IMAGE_MUTATION = gql`
  mutation RemoveSalonGalleryImage($salonId: ID!, $index: Int!) {
    removeSalonGalleryImage(salonId: $salonId, index: $index) {
      id
      mainImageUrl
      galleryUrls
    }
  }
`

export const UPDATE_SALON_HOURS_MUTATION = gql`
  mutation UpdateSalonHours($salonId: ID!, $input: UpdateSalonHoursInput!) {
    updateSalonHours(salonId: $salonId, input: $input) {
      id
      hours {
        weekday
        closed
        opensAt
        closesAt
        breakStartsAt
        breakEndsAt
      }
      cancellationNoticeHours
    }
  }
`

export const CREATE_SALON_SERVICE_MUTATION = gql`
  mutation CreateSalonService($salonId: ID!, $input: CreateSalonServiceInput!) {
    createSalonService(salonId: $salonId, input: $input) {
      id
      name
      durationMinutes
      priceFeninga
    }
  }
`

export const UPDATE_SALON_SERVICE_MUTATION = gql`
  mutation UpdateSalonService($id: ID!, $input: UpdateSalonServiceInput!) {
    updateSalonService(id: $id, input: $input) {
      id
      name
      durationMinutes
      priceFeninga
    }
  }
`

export const CREATE_SALON_SERVICE_CATEGORY_MUTATION = gql`
  mutation CreateSalonServiceCategory($salonId: ID!, $input: CreateSalonServiceCategoryInput!) {
    createSalonServiceCategory(salonId: $salonId, input: $input) {
      id
      name
    }
  }
`

export const UPDATE_SALON_SERVICE_CATEGORY_MUTATION = gql`
  mutation UpdateSalonServiceCategory($id: ID!, $input: UpdateSalonServiceCategoryInput!) {
    updateSalonServiceCategory(id: $id, input: $input) {
      id
      name
    }
  }
`

export const DELETE_SALON_SERVICE_CATEGORY_MUTATION = gql`
  mutation DeleteSalonServiceCategory($id: ID!) {
    deleteSalonServiceCategory(id: $id)
  }
`

export const CREATE_SALON_WORKER_MUTATION = gql`
  mutation CreateSalonWorker($salonId: ID!, $input: CreateSalonWorkerInput!) {
    createSalonWorker(salonId: $salonId, input: $input) {
      id
      name
    }
  }
`

export const UPDATE_SALON_WORKER_MUTATION = gql`
  mutation UpdateSalonWorker($id: ID!, $input: UpdateSalonWorkerInput!) {
    updateSalonWorker(id: $id, input: $input) {
      id
      name
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
      description: string | null
      mainImageUrl: string | null
      galleryUrls: string[]
      cancellationNoticeHours: number
      hours: {
        weekday: string
        closed: boolean
        opensAt: string | null
        closesAt: string | null
        breakStartsAt: string | null
        breakEndsAt: string | null
      }[]
      serviceCategories: {
        id: string
        name: string
        services: {
          id: string
          name: string
          durationMinutes: number
          priceFeninga: number
        }[]
      }[]
      services: {
        id: string
        name: string
        durationMinutes: number
        priceFeninga: number
      }[]
      workers: {
        id: string
        name: string
      }[]
    }[]
  } | null
}
