// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('zapisi is a lazy owner route', () => {
  const app = read('App.tsx')
  expect(app).toMatch(/const OwnerZapisi = lazy\(/)
  expect(app).toMatch(/path="\/owner\/zapisi"/)
  expect(app).toMatch(/salon\.loading/)
})

test('OwnerNav puts Zapisi under Zahtjevi', () => {
  const nav = read('components/OwnerNav.tsx')
  expect(nav.indexOf('owner.title')).toBeLessThan(nav.indexOf('owner.zapisi'))
  expect(nav.indexOf('owner.zapisi')).toBeLessThan(nav.indexOf('owner.chat'))
  expect(nav).toMatch(/active === 'zapisi'/)
  expect(nav).toMatch(/ownerZapisiPath/)
})

test('zapisi page is a day list with origin chips and no live subscription', () => {
  const page = read('pages/OwnerZapisi.tsx')
  expect(page).toMatch(/<TopNav/)
  expect(page).toMatch(/min-h-svh md:flex/)
  expect(page).toMatch(/active="zapisi"/)
  expect(page).toMatch(/useOwnerPush\(ownerReady\)/)
  expect(page).toMatch(/inFlightIntakeCount/)
  expect(page).toMatch(/allowRegister=\{false\}/)
  expect(page).toMatch(/data\?\.me == null[\s\S]*auth\.placePanel[\s\S]*AuthShell/)
  expect(page).toMatch(/emailVerified[\s\S]*auth\.placePanel[\s\S]*EmailVerifyPanel/)
  expect(page).toMatch(/owner\.notOwner/)
  expect(page).toMatch(/CREATE_SALON_PATH/)
  expect(page).toMatch(/owner\.zapisi/)
  expect(page).toMatch(/type="date"/)
  expect(page).toMatch(/owner\.date/)
  expect(page).toMatch(/owner\.originAll/)
  expect(page).toMatch(/owner\.originGuest/)
  expect(page).toMatch(/owner\.assistant/)
  expect(page).toMatch(/owner\.phone\.button/)
  expect(page).toMatch(/SALON_DAY_BOOKINGS_QUERY/)
  expect(page).toMatch(/fetchPolicy: 'network-only'/)
  expect(page).not.toMatch(/bookingCustomerResponded/)
  expect(page).not.toMatch(/bookingRescheduled/)
  expect(page).not.toMatch(/bookingCancelled/)
  expect(page).toMatch(/requestFromZapisiPath/)
  expect(page).toMatch(/formatSarajevoTime/)
  expect(page).toMatch(/TIME_PROPOSED/)
  expect(page).toMatch(/proposedStartsAt/)
  expect(page).toMatch(/currentJobLabel/)
  expect(page).toMatch(/bookings\.status/)
  expect(page).toMatch(/customerName/)
  expect(page).not.toMatch(/workerName/)
  expect(page).not.toMatch(/owner\.empty/)
  expect(page).not.toMatch(/occupyingBookingsRange/)
})

test('request detail Nazad returns to Zapisi only when opened from there', () => {
  const detail = read('pages/OwnerRequestDetail.tsx')
  expect(detail).toMatch(/search\.get\('from'\) === 'zapisi'/)
  expect(detail).toMatch(/ownerZapisiPath/)
  expect(detail).toMatch(/ownerQueuePath/)
  expect(detail).toMatch(/to=\{leavePath\}/)
})
