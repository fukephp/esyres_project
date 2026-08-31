import { gql } from '@apollo/client'
import type { BusyLevel } from '../lib/busyToken'

export const PUBLIC_SALON_QUERY = gql`
  query PublicSalon($id: ID!, $date: String!) {
    salon(id: $id) {
      id
      name
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
        category
        durationMinutes
        priceFeninga
      }
      workers {
        id
        name
      }
      busyLevel(date: $date)
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
  category: 'HAIR' | 'MAKE_UP' | 'MASSAGE'
  durationMinutes: number
  priceFeninga: number
}

export type SalonWorker = {
  id: string
  name: string
}

export type PublicSalon = {
  id: string
  name: string
  hours: DayHours[]
  services: SalonService[]
  workers: SalonWorker[]
  busyLevel: BusyLevel
}

export type PublicSalonData = {
  salon: PublicSalon | null
}
