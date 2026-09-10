import { assistantStep, type AssistantStep } from './assistant'

export type IntakeSnapshot = {
  serviceIds: string[]
  workerId: string | null
  workerConfirmed: boolean
  preferredDate: string
  preferredTime: string
}

export type IntakeProgress =
  | { type: 'services'; text: string }
  | { type: 'step'; step: AssistantStep }

export function emptyIntakeSnapshot(): IntakeSnapshot {
  return {
    serviceIds: [],
    workerId: null,
    workerConfirmed: false,
    preferredDate: '',
    preferredTime: '',
  }
}

export function isEmptyIntakeSnapshot(snapshot: IntakeSnapshot): boolean {
  return (
    snapshot.serviceIds.length === 0 &&
    snapshot.workerId === null &&
    !snapshot.workerConfirmed &&
    snapshot.preferredDate === '' &&
    snapshot.preferredTime === ''
  )
}

export function intakeSnapshotChanged(prev: IntakeSnapshot, next: IntakeSnapshot): boolean {
  return JSON.stringify(prev) !== JSON.stringify(next)
}

export function shouldUpsertIntake(prev: IntakeSnapshot, next: IntakeSnapshot, waiting = false): boolean {
  return !waiting && intakeSnapshotChanged(prev, next) && !isEmptyIntakeSnapshot(next)
}

export function intakeWaiting(takenOver: boolean): boolean {
  return takenOver
}

export type TakeoverRowChrome = 'takeover' | 'release' | 'hidden'

export function takeoverRowChrome(input: { takeoverAllowed: boolean; takenOver: boolean }): TakeoverRowChrome {
  if (!input.takeoverAllowed) {
    return 'hidden'
  }

  return input.takenOver ? 'release' : 'takeover'
}

export function shouldRestoreIntake(row: IntakeSnapshot | null): boolean {
  return row !== null && !isEmptyIntakeSnapshot(row)
}

export function intakeSnapshotFromRow(row: {
  serviceIds: string[]
  workerId: string | null
  workerConfirmed: boolean
  preferredDate: string | null
  preferredTime: string | null
}): IntakeSnapshot {
  return {
    serviceIds: row.serviceIds,
    workerId: row.workerId,
    workerConfirmed: row.workerConfirmed,
    preferredDate: row.preferredDate ?? '',
    preferredTime: row.preferredTime ?? '',
  }
}

export function intakeProgressLine(serviceNames: string[], step: AssistantStep): IntakeProgress {
  if (serviceNames.length > 0) {
    return { type: 'services', text: serviceNames.join(', ') }
  }

  return { type: 'step', step }
}

export function chatBadgeCount(n: number): number | null {
  return n < 1 ? null : n
}

export function intakeCookieName(salonId: string): string {
  return `esyres_intake_${salonId}`
}

export function readIntakeToken(
  salonId: string,
  cookie = typeof document === 'undefined' ? '' : document.cookie,
): string | null {
  const prefix = `${intakeCookieName(salonId)}=`
  for (const part of cookie.split(';')) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      const value = decodeURIComponent(trimmed.slice(prefix.length))
      return value === '' ? null : value
    }
  }

  return null
}

export function writeIntakeToken(salonId: string, token: string): void {
  if (typeof document === 'undefined') {
    return
  }
  document.cookie = `${intakeCookieName(salonId)}=${encodeURIComponent(token)}; Max-Age=86400; SameSite=Lax; Path=/`
}

export function clearIntakeToken(salonId: string): void {
  if (typeof document === 'undefined') {
    return
  }
  document.cookie = `${intakeCookieName(salonId)}=; Max-Age=0; Path=/`
}

export function withIntakeToken<T extends object>(input: T, token: string | null): T & { intakeToken?: string } {
  if (token === null || token === '') {
    return input
  }

  return { ...input, intakeToken: token }
}

export function intakeStepFromSnapshot(
  snapshot: IntakeSnapshot,
  workerCount: number,
): AssistantStep {
  return assistantStep({
    serviceIds: snapshot.serviceIds,
    workerCount,
    workerConfirmed: snapshot.workerConfirmed,
    preferredDate: snapshot.preferredDate,
    preferredTime: snapshot.preferredTime,
  })
}
