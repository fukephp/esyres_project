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
    }
  }
`

export const IN_FLIGHT_INTAKE_COUNT_QUERY = gql`
  query InFlightIntakeCount($salonId: ID!) {
    inFlightIntakeCount(salonId: $salonId)
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
