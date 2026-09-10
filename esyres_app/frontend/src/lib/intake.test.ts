import { expect, test } from 'vitest'
import {
  chatBadgeCount,
  emptyIntakeSnapshot,
  intakeCookieName,
  intakeProgressLine,
  intakeSnapshotFromRow,
  intakeWaiting,
  readIntakeToken,
  shouldRestoreIntake,
  shouldUpsertIntake,
  takeoverRowChrome,
  unknownChipChrome,
  pingChrome,
  intakePingMark,
  withIntakeToken,
} from './intake'

const empty = emptyIntakeSnapshot()

test('CTA-open empty snapshot does not upsert', () => {
  expect(shouldUpsertIntake(empty, empty)).toBe(false)
})

test('first service chip upserts', () => {
  expect(shouldUpsertIntake(empty, { ...empty, serviceIds: ['1'] })).toBe(true)
})

test('waiting snapshot does not upsert', () => {
  expect(shouldUpsertIntake(empty, { ...empty, serviceIds: ['1'] }, true)).toBe(false)
})

test('intake waiting follows takenOver', () => {
  expect(intakeWaiting(false)).toBe(false)
  expect(intakeWaiting(true)).toBe(true)
})

test('row chrome hides when take-over is off', () => {
  expect(takeoverRowChrome({ takeoverAllowed: false, takenOver: false })).toBe('hidden')
  expect(takeoverRowChrome({ takeoverAllowed: false, takenOver: true })).toBe('hidden')
  expect(takeoverRowChrome({ takeoverAllowed: true, takenOver: false })).toBe('takeover')
  expect(takeoverRowChrome({ takeoverAllowed: true, takenOver: true })).toBe('release')
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

test('pinged empty snapshot still restores', () => {
  expect(shouldRestoreIntake(empty, true)).toBe(true)
  expect(shouldRestoreIntake(null, true)).toBe(true)
})

test('escape chip hides when waiting or sent', () => {
  expect(unknownChipChrome({ waiting: false, sent: false })).toBe('shown')
  expect(unknownChipChrome({ waiting: true, sent: false })).toBe('hidden')
  expect(unknownChipChrome({ waiting: false, sent: true })).toBe('hidden')
})

test('ping chrome follows unknown then pinged then wait', () => {
  expect(pingChrome({ waiting: false, unknownShown: false, pinged: false })).toBe('hidden')
  expect(pingChrome({ waiting: false, unknownShown: true, pinged: false })).toBe('cta')
  expect(pingChrome({ waiting: false, unknownShown: true, pinged: true })).toBe('done')
  expect(pingChrome({ waiting: false, unknownShown: false, pinged: true })).toBe('done')
  expect(pingChrome({ waiting: true, unknownShown: true, pinged: false })).toBe('hidden')
  expect(pingChrome({ waiting: true, unknownShown: false, pinged: true })).toBe('hidden')
})

test('owner ping mark is on iff pinged', () => {
  expect(intakePingMark(false)).toBe(false)
  expect(intakePingMark(true)).toBe(true)
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

test('take over copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('owner.takeOver')).toBe('Preuzmi')
  expect(i18n.t('owner.releaseTakeOver')).toBe('Vrati asistentu')
  expect(i18n.t('owner.dnd')).toBe('Ne uznemiravaj')
  expect(i18n.t('assistant.wait')).toBe('Sačekaj, javit ćemo ti se.')
})

test('unknown and ping copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('assistant.other')).toBe('Nešto drugo?')
  expect(i18n.t('assistant.unknown')).toBe('Ne znam. To nemam u podacima.')
  expect(i18n.t('assistant.ping')).toBe('Obavijesti salon')
  expect(i18n.t('assistant.pinged')).toBe('Javili smo salonu. Možeš nastaviti.')
  expect(i18n.t('owner.ping')).toBe('Pitanje')
})

