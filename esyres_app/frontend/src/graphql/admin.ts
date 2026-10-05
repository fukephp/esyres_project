import { gql } from '@apollo/client'

export const ADMIN_OVERVIEW_QUERY = gql`
  query AdminOverview {
    adminOverview {
      pendingSalons
      ownedSalons
      bookings
    }
  }
`

export const PENDING_SALONS_QUERY = gql`
  query PendingSalons {
    pendingSalons {
      id
      name
      personName
    }
  }
`

export const APPROVE_SALON = gql`
  mutation ApproveSalon($id: ID!) {
    approveSalon(id: $id) {
      id
    }
  }
`

export const REJECT_SALON = gql`
  mutation RejectSalon($id: ID!) {
    rejectSalon(id: $id)
  }
`

export type AdminOverviewData = {
  adminOverview: { pendingSalons: number; ownedSalons: number; bookings: number }
}

export type PendingSalonRow = { id: string; name: string; personName: string }

export type PendingSalonsData = { pendingSalons: PendingSalonRow[] }
