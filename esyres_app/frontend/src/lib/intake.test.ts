import { expect, test } from 'vitest'
import {
  chatBadgeCount,
  emptyIntakeSnapshot,
  intakeCookieName,
  intakeProgressLine,
  intakeSnapshotFromRow,
  readIntakeToken,
  shouldRestoreIntake,
  shouldUpsertIntake,
  withIntakeToken,
} from './intake'

const empty = emptyIntakeSnapshot()

test('CTA-open empty snapshot does not upsert', () => {
  expect(shouldUpsertIntake(empty, empty)).toBe(false)
})

test('first service chip upserts', () => {
  expect(shouldUpsertIntake(empty, { ...empty, serviceIds: ['1'] })).toBe(true)
})

test('same snapshot does not upsert again', () => {
  const next = { ...empty, serviceIds: ['1'] }
  expect(shouldUpsertIntake(next, next)).toBe(false)
})

test('restore only when a snapshot exists', () => {
  expect(shouldRestoreIntake(null)).toBe(false)
  expect(shouldRestoreIntake(empty)).toBe(false)
  expect(shouldRestoreIntake({ ...empty, serviceIds: ['1'] })).toBe(true)
})

test('progress line prefers service names then the step', () => {
  expect(intakeProgressLine(['Šišanje', 'Farbanje'], 'worker')).toEqual({
    type: 'services',
    text: 'Šišanje, Farbanje',
  })
  expect(intakeProgressLine([], 'date')).toEqual({ type: 'step', step: 'date' })
})

test('badge hides at zero', () => {
  expect(chatBadgeCount(0)).toBeNull()
  expect(chatBadgeCount(-1)).toBeNull()
  expect(chatBadgeCount(3)).toBe(3)
})

test('cookie name is per salon', () => {
  expect(intakeCookieName('9')).toBe('esyres_intake_9')
  expect(readIntakeToken('9', 'esyres_intake_9=abc-token; other=1')).toBe('abc-token')
  expect(readIntakeToken('9', '')).toBeNull()
})

test('chat send adds intakeToken when present', () => {
  const input = { salonId: '1', serviceIds: ['2'], preferredDate: '2026-09-01', preferredTime: '10:00' }
  expect(withIntakeToken(input, null)).toEqual(input)
  expect(withIntakeToken(input, 'tok-1').intakeToken).toBe('tok-1')
})

test('row restore maps null clocks to empty strings', () => {
  expect(
    intakeSnapshotFromRow({
      serviceIds: ['1'],
      workerId: null,
      workerConfirmed: false,
      preferredDate: null,
      preferredTime: null,
    }),
  ).toEqual({ ...empty, serviceIds: ['1'] })
})
