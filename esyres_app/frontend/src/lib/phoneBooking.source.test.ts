// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('phone booking is a lazy owner route', () => {
  const app = read('App.tsx')
  expect(app).toMatch(/const OwnerPhoneBooking = lazy\(/)
  expect(app).toMatch(/path="\/owner\/phone"/)
  expect(app).toMatch(/salon\.loading/)
})

test('Zahtjevi links Telefon with the return day', () => {
  const home = read('pages/OwnerHome.tsx')
  expect(home).toMatch(/owner\.phone\.button/)
  expect(home).toMatch(/ownerPhonePath/)
  expect(home).not.toMatch(/Zapisi/)
})

test('phone page is four steps and does not seed the day', () => {
  const page = read('pages/OwnerPhoneBooking.tsx')
  expect(page).toMatch(/<TopNav/)
  expect(page).toMatch(/min-h-svh md:flex/)
  expect(page).toMatch(/active="queue"/)
  expect(page).toMatch(/useOwnerPush\(ownerReady\)/)
  expect(page).toMatch(/inFlightIntakeCount/)
  expect(page).toMatch(/allowRegister=\{false\}/)
  expect(page).toMatch(/data\?\.me == null[\s\S]*auth\.placePanel[\s\S]*AuthShell/)
  expect(page).toMatch(/emailVerified[\s\S]*auth\.placePanel[\s\S]*EmailVerifyPanel/)
  expect(page).toMatch(/owner\.notOwner/)
  expect(page).toMatch(/CREATE_SALON_PATH/)
  expect(page).toMatch(/owner\.phone\.title/)
  expect(page).toMatch(/owner\.phone\.services/)
  expect(page).toMatch(/owner\.phone\.when/)
  expect(page).toMatch(/owner\.phone\.worker/)
  expect(page).toMatch(/owner\.phone\.caller/)
  expect(page).toMatch(/owner\.phone\.next/)
  expect(page).toMatch(/owner\.phone\.noWorker/)
  expect(page).toMatch(/owner\.phone\.note/)
  expect(page).toMatch(/auth\.name/)
  expect(page).toMatch(/auth\.phone/)
  expect(page).toMatch(/salon\.date/)
  expect(page).toMatch(/salon\.time/)
  expect(page).toMatch(/type="date"/)
  expect(page).toMatch(/type="time"/)
  expect(page).toMatch(/useState\(''\)/)
  expect(page).not.toMatch(/useState\(params\.get\('date'\)/)
  expect(page).toMatch(/owner\.back/)
  expect(page).toMatch(/ownerQueuePath/)
  expect(page).toMatch(/setStep\(\(n\) => n - 1\)/)
  expect(page).toMatch(/resetDraft\(\)/)
  expect(page).toMatch(/owner\.save/)
  expect(page).toMatch(/CREATE_PHONE_BOOKING_MUTATION/)
  expect(page).toMatch(/INVALID_CALLER_NAME/)
  expect(page).toMatch(/return/)
  expect(page.indexOf('INVALID_CALLER_NAME')).toBeLessThan(page.indexOf('createPhone('))
  expect(page).toMatch(/ownerQueuePath\(saved/)
  expect(page).not.toMatch(/Nema preference/)
})

test('request detail phone cancel omits prior bookings', () => {
  const detail = read('pages/OwnerRequestDetail.tsx')
  const cancel = detail.slice(detail.indexOf('function PhoneCancel'))
  expect(cancel).toMatch(/owner\.phone\.cancel/)
  expect(cancel).toMatch(/bookings\.cancelBooking/)
  expect(cancel).toMatch(/owner\.declineCancel/)
  expect(cancel).not.toMatch(/declineReason/)
  expect(cancel).toMatch(/preferredStartsAt/)
  expect(detail).toMatch(/CANCEL_PHONE_BOOKING_MUTATION/)
  expect(detail).toMatch(/origin === 'PHONE'/)
  expect(detail).toMatch(/callerPhone/)
  expect(detail).toMatch(/callerNote/)
  expect(detail).toMatch(/booking\.origin === 'PHONE' \? null/)
})
