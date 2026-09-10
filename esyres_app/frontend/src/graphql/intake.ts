import { gql } from '@apollo/client'

export const ASSISTANT_INTAKE_QUERY = gql`
  query AssistantIntake($token: String!) {
    assistantIntake(token: $token) {
      id
      token
      customerName
      serviceIds
      workerId
      workerConfirmed
      preferredDate
      preferredTime
      takenOver
    }
  }
`

export const UPSERT_ASSISTANT_INTAKE_MUTATION = gql`
  mutation UpsertAssistantIntake($input: UpsertAssistantIntakeInput!) {
    upsertAssistantIntake(input: $input) {
      id
      token
      customerName
      serviceIds
      workerId
      workerConfirmed
      preferredDate
      preferredTime
      takenOver
    }
  }
`

export const IN_FLIGHT_INTAKES_QUERY = gql`
  query InFlightIntakes($salonId: ID!) {
    inFlightIntakes(salonId: $salonId) {
      id
      customerName
      updatedAt
      serviceIds
      workerId
      workerConfirmed
      preferredDate
      preferredTime
      takenOver
    }
  }
`

export const IN_FLIGHT_INTAKE_COUNT_QUERY = gql`
  query InFlightIntakeCount($salonId: ID!) {
    inFlightIntakeCount(salonId: $salonId)
  }
`

export const TAKE_OVER_INTAKE_MUTATION = gql`
  mutation TakeOverAssistantIntake($id: ID!) {
    takeOverAssistantIntake(id: $id) {
      id
      takenOver
    }
  }
`

export const RELEASE_INTAKE_MUTATION = gql`
  mutation ReleaseAssistantIntake($id: ID!) {
    releaseAssistantIntake(id: $id) {
      id
      takenOver
    }
  }
`

export const UPDATE_SALON_DND_MUTATION = gql`
  mutation UpdateSalonDnd($salonId: ID!, $dnd: Boolean!) {
    updateSalonDnd(salonId: $salonId, dnd: $dnd) {
      id
      dnd
      takeoverAllowed
    }
  }
`

export type AssistantIntakeRow = {
  id: string
  token: string
  customerName: string
  serviceIds: string[]
  workerId: string | null
  workerConfirmed: boolean
  preferredDate: string | null
  preferredTime: string | null
  takenOver: boolean
}

export type InFlightIntakeRow = {
  id: string
  customerName: string
  updatedAt: string
  serviceIds: string[]
  workerId: string | null
  workerConfirmed: boolean
  preferredDate: string | null
  preferredTime: string | null
  takenOver: boolean
}

export type AssistantIntakeData = {
  assistantIntake: AssistantIntakeRow | null
}

export type UpsertAssistantIntakeData = {
  upsertAssistantIntake: AssistantIntakeRow
}

export type InFlightIntakesData = {
  inFlightIntakes: InFlightIntakeRow[]
}

export type InFlightIntakeCountData = {
  inFlightIntakeCount: number
}
