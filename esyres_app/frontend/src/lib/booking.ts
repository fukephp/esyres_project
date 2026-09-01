export function stackSelection(
  services: { durationMinutes: number; priceFeninga: number }[],
): { durationMinutes: number; priceFeninga: number } {
  return {
    durationMinutes: services.reduce((sum, s) => sum + s.durationMinutes, 0),
    priceFeninga: services.reduce((sum, s) => sum + s.priceFeninga, 0),
  }
}

export function graphqlErrorCode(error: unknown): string | null {
  if (error === null || typeof error !== 'object' || !('graphQLErrors' in error)) {
    return null
  }
  const errors = (error as { graphQLErrors: { extensions?: { code?: string } }[] }).graphQLErrors
  return errors[0]?.extensions?.code ?? null
}

export function bookingWorkerId(selected: string): string | undefined {
  if (selected === '') {
    return undefined
  }
  return selected
}

export type BookingStatus = 'REQUESTED' | 'TIME_PROPOSED' | 'CONFIRMED' | 'DECLINED'

export type BookingClockRow = {
  status: BookingStatus
  preferredStartsAt: string
  worker: { id: string; name: string } | null
  proposedStartsAt: string | null
  proposedWorker: { id: string; name: string } | null
}

export function bookingClock(row: BookingClockRow): {
  startsAt: string
  worker: { id: string; name: string } | null
} {
  if (row.status === 'TIME_PROPOSED') {
    return {
      startsAt: row.proposedStartsAt ?? row.preferredStartsAt,
      worker: row.proposedWorker,
    }
  }

  return { startsAt: row.preferredStartsAt, worker: row.worker }
}

export function bookingStatusKey(status: string): BookingStatus {
  if (status === 'TIME_PROPOSED' || status === 'CONFIRMED' || status === 'DECLINED') {
    return status
  }

  return 'REQUESTED'
}

const RESPOND_ERROR_KEYS = [
  'NOT_TIME_PROPOSED',
  'EMAIL_UNVERIFIED',
  'PHONE_UNVERIFIED',
  'SALON_CLOSED',
  'PAST_TIME',
  'INVALID_DATE',
  'INVALID_TIME',
  'FORBIDDEN',
  'SLOT_TAKEN',
] as const

export type RespondErrorKey = (typeof RESPOND_ERROR_KEYS)[number] | 'fallback'

export function respondErrorKey(code: string | null): RespondErrorKey {
  if (code !== null && (RESPOND_ERROR_KEYS as readonly string[]).includes(code)) {
    return code as (typeof RESPOND_ERROR_KEYS)[number]
  }

  return 'fallback'
}
