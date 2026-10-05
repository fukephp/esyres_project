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

export type BookingStatus = 'REQUESTED' | 'TIME_PROPOSED' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED'

export type BookingClockRow = {
  status: BookingStatus
  preferredStartsAt: string | null
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
      startsAt: row.proposedStartsAt ?? row.preferredStartsAt ?? '',
      worker: row.proposedWorker,
    }
  }

  return { startsAt: row.preferredStartsAt ?? '', worker: row.worker }
}

export function sarajevoDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sarajevo' }).format(now)
}

export function isUnansweredBooking(
  row: { status: string; preferredDate?: string; declineReason?: string | null },
  now = new Date(),
): boolean {
  if (row.status === 'DECLINED' && row.declineReason === 'expired') {
    return true
  }

  return row.status === 'REQUESTED' && (row.preferredDate ?? '') !== '' && row.preferredDate! < sarajevoDay(now)
}

export function expiresToday(
  row: { status: string; preferredDate?: string },
  now = new Date(),
): boolean {
  return row.status === 'REQUESTED' && row.preferredDate === sarajevoDay(now)
}

export function compareUnanswered<T extends { preferredStartsAt: string | null; id: string }>(a: T, b: T): number {
  if (a.preferredStartsAt === null && b.preferredStartsAt !== null) {
    return 1
  }
  if (a.preferredStartsAt !== null && b.preferredStartsAt === null) {
    return -1
  }
  if (a.preferredStartsAt !== null && b.preferredStartsAt !== null && a.preferredStartsAt !== b.preferredStartsAt) {
    return a.preferredStartsAt < b.preferredStartsAt ? -1 : 1
  }

  return Number(a.id) - Number(b.id)
}

export function guestStatusKey(
  row: { status: string; preferredDate?: string; declineReason?: string | null },
  now = new Date(),
): string {
  if (isUnansweredBooking(row, now)) {
    return 'UNANSWERED'
  }

  return bookingStatusKey(row.status)
}

export function bookingStatusKey(status: string): BookingStatus {
  if (
    status === 'TIME_PROPOSED' ||
    status === 'CONFIRMED' ||
    status === 'DECLINED' ||
    status === 'CANCELLED'
  ) {
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
  'SAME_DAY_SERVICE',
] as const

export type RespondErrorKey = (typeof RESPOND_ERROR_KEYS)[number] | 'fallback'

export function respondErrorKey(code: string | null): RespondErrorKey {
  if (code !== null && (RESPOND_ERROR_KEYS as readonly string[]).includes(code)) {
    return code as (typeof RESPOND_ERROR_KEYS)[number]
  }

  return 'fallback'
}

export function rescheduleChrome(args: { confirmed: boolean; pending: boolean }): 'ask' | 'pending' | 'hidden' {
  if (!args.confirmed) {
    return 'hidden'
  }

  return args.pending ? 'pending' : 'ask'
}

const RESCHEDULE_ERROR_KEYS = [
  'NOT_CONFIRMED',
  'RESCHEDULE_DISABLED',
  'EMAIL_UNVERIFIED',
  'PHONE_UNVERIFIED',
  'SALON_CLOSED',
  'PAST_TIME',
  'INVALID_DATE',
  'INVALID_TIME',
  'FORBIDDEN',
  'SAME_DAY_SERVICE',
] as const

export type RescheduleErrorKey = (typeof RESCHEDULE_ERROR_KEYS)[number] | 'fallback'

export function rescheduleErrorKey(code: string | null): RescheduleErrorKey {
  if (code !== null && (RESCHEDULE_ERROR_KEYS as readonly string[]).includes(code)) {
    return code as (typeof RESCHEDULE_ERROR_KEYS)[number]
  }

  return 'fallback'
}

export function cancelChrome(args: { confirmed: boolean; startsAt: string; now: number }): 'show' | 'hidden' {
  if (!args.confirmed) {
    return 'hidden'
  }
  if (Date.parse(args.startsAt) <= args.now) {
    return 'hidden'
  }

  return 'show'
}

const CANCEL_ERROR_KEYS = [
  'NOT_CONFIRMED',
  'PAST_START',
  'EMAIL_UNVERIFIED',
  'PHONE_UNVERIFIED',
  'FORBIDDEN',
] as const

export type CancelErrorKey = (typeof CANCEL_ERROR_KEYS)[number] | 'fallback'

export function cancelErrorKey(code: string | null): CancelErrorKey {
  if (code !== null && (CANCEL_ERROR_KEYS as readonly string[]).includes(code)) {
    return code as (typeof CANCEL_ERROR_KEYS)[number]
  }

  return 'fallback'
}

export function groupMyBookings<T extends { status: string; preferredDate?: string; declineReason?: string | null }>(
  rows: T[],
  now = new Date(),
): { onHold: T[]; lastConfirmed: T | null; lastDeclined: T | null; history: T[] } {
  const unanswered = (row: T) => isUnansweredBooking(row, now)
  const onHold = rows.filter((row) => !unanswered(row) && (row.status === 'REQUESTED' || row.status === 'TIME_PROPOSED'))
  const lastConfirmed = rows.find((row) => row.status === 'CONFIRMED') ?? null
  const lastDeclined = rows.find((row) => row.status === 'DECLINED' || unanswered(row)) ?? null
  const history = rows.filter((row) => !onHold.includes(row) && row !== lastConfirmed && row !== lastDeclined)
  return { onHold, lastConfirmed, lastDeclined, history }
}
