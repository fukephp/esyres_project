import { gql } from '@apollo/client'
import type { BusyLevel } from '../lib/busyToken'

export const PUBLIC_SALON_QUERY = gql`
  query PublicSalon($id: ID!, $date: String!, $chosenDate: String!) {
    salon(id: $id) {
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
      services {
        id
        name
        durationMinutes
        priceFeninga
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
      workers {
        id
        name
      }
      busyLevel(date: $date)
      chatBusyLevel: busyLevel(date: $chosenDate)
    }
  }
`

export type DayHours = {
  weekday: string
  closed: boolean
  opensAt: string | null
  closesAt: string | null
  breakStartsAt: string | null
  breakEndsAt: string | null
}

export type SalonService = {
  id: string
  name: string
  durationMinutes: number
  priceFeninga: number
}

export type SalonServiceCategory = {
  id: string
  name: string
  services: SalonService[]
}

export type SalonWorker = {
  id: string
  name: string
}

export type PublicSalon = {
  id: string
  name: string
  address: string | null
  hours: DayHours[]
  services: SalonService[]
  serviceCategories: SalonServiceCategory[]
  workers: SalonWorker[]
  busyLevel: BusyLevel
  chatBusyLevel: BusyLevel
}

export type PublicSalonData = {
  salon: PublicSalon | null
}
