// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('salonHours does not import owner.ts', () => {
  expect(read('lib/salonHours.ts')).not.toMatch(/from '\.\/owner'/)
})

test('salon profile stack is address, split aside, then hours/services/form', () => {
  const page = read('pages/SalonProfile.tsx')
  const catalog = page.slice(page.indexOf('const catalog ='), page.indexOf('\n  return ('))
  const view = page.slice(page.indexOf('\n  return ('))

  const nameAt = view.indexOf('{salon.name}')
  const addressAt = view.indexOf('{addressLine}')
  const splitAt = view.indexOf('SALON_BOOKING_SPLIT_CLASS')
  const asideAt = view.indexOf('SALON_BOOKING_ASIDE_CLASS')
  const catalogUseAt = view.indexOf('SALON_BOOKING_MAIN_CLASS}>{catalog}')
  const successAt = view.indexOf("t('salon.success')")

  expect(nameAt).toBeGreaterThan(-1)
  expect(addressAt).toBeGreaterThan(nameAt)
  expect(splitAt).toBeGreaterThan(addressAt)
  expect(asideAt).toBeGreaterThan(splitAt)
  expect(catalogUseAt).toBeGreaterThan(asideAt)
  expect(successAt).toBeGreaterThan(catalogUseAt)

  expect(view).toMatch(/showBookingColumn \?/)
  expect(page).toMatch(/const showBookingColumn = hasServices && !sent/)
  expect(page).not.toMatch(/hasServices && mode === 'idle'/)

  const hoursAt = catalog.indexOf("t('salon.hours')")
  const servicesAt = catalog.indexOf("t('salon.services')")
  const formAt = catalog.indexOf('max-w-md')
  expect(hoursAt).toBeGreaterThan(-1)
  expect(servicesAt).toBeGreaterThan(hoursAt)
  expect(formAt).toBeGreaterThan(servicesAt)
  expect(catalog).toMatch(/showBookingColumn \? undefined : 'mt-8'/)
  expect(catalog).not.toMatch(/hasServices && !picking && !sent/)
  expect(catalog).not.toMatch(/salon\.sendHint/)
  expect(catalog).not.toMatch(/assistant\.ask/)

  expect(page).toMatch(/SalonServiceGroups/)
  expect(page).toMatch(/svc-cat-\$\{group\.id\}/)
  expect(page).toMatch(/hidden w-40 shrink-0 md:block/)
  expect(page).toMatch(/visible\.length >= 2/)
  expect(page).not.toMatch(/category\.\$\{/)
})

test('address is optional text line; no maps', () => {
  const page = read('pages/SalonProfile.tsx')
  expect(page).toMatch(/assistantAddressLine\(salon\.address\)/)
  expect(page).toMatch(/addressLine !== null \? <p className="mt-3 text-sm text-muted">\{addressLine\}<\/p>/)
  expect(page).not.toMatch(/Adresa/)
  expect(page).not.toMatch(/maps\.google/)
  expect(page).not.toMatch(/\blat\b|\blng\b/)
})

test('one aside send uses lower rules and scrolls; split gone when sent', () => {
  const page = read('pages/SalonProfile.tsx')
  const sendHits = page.match(/hasServices && !picking && !sent/g) ?? []
  expect(sendHits).toHaveLength(1)

  const aside = page.slice(page.indexOf('SALON_BOOKING_ASIDE_CLASS'), page.indexOf('SALON_BOOKING_MAIN_CLASS'))
  expect(aside).toMatch(/hasServices && !picking && !sent/)
  expect(aside).toMatch(/className=\{SALON_SEND_CLASS\}/)
  expect(aside).toMatch(/openIntake\('picker'\)/)
  expect(aside).toMatch(/setScrollPicker\(true\)/)
  expect(aside).toMatch(/salon\.send/)
  expect(aside).toMatch(/mode === 'idle'/)
  expect(aside).toMatch(/salon\.sendHint/)
  expect(aside).toMatch(/mt-2 text-sm text-muted/)
  expect(aside).toMatch(/showChatCta\(salon\.services\.length, sent\) && !chatting/)
  expect(aside).not.toMatch(/max-w-md/)
  expect(page).toMatch(/showBookingColumn \? \(/)
  expect(page).toMatch(/CREATE_BOOKING_MUTATION/)
})

test('sendHint is only in the booking aside; chat alternate stays underline', () => {
  const page = read('pages/SalonProfile.tsx')
  const aside = page.slice(page.indexOf('SALON_BOOKING_ASIDE_CLASS'), page.indexOf('SALON_BOOKING_MAIN_CLASS'))
  expect(aside).toMatch(/salon\.sendHint/)
  expect(aside).toMatch(/underline underline-offset-4[\s\S]*assistant\.ask/)
  expect(aside.slice(aside.indexOf("t('assistant.ask')") - 280, aside.indexOf("t('assistant.ask')"))).not.toMatch(/SALON_SEND_CLASS/)
  expect(aside.slice(aside.indexOf("t('assistant.ask')") - 280, aside.indexOf("t('assistant.ask')"))).not.toMatch(/bg-ink/)

  const catalog = page.slice(page.indexOf('const catalog ='), page.indexOf('\n  return ('))
  expect(catalog).not.toMatch(/salon\.sendHint/)

  const chat = read('components/AssistantIntake.tsx')
  expect(chat).not.toMatch(/salon\.sendHint/)
})

test('hours rows use helpers; closed is muted; chat tap does not copy intake', () => {
  const page = read('pages/SalonProfile.tsx')
  expect(page).toMatch(/hoursRowClosed/)
  expect(page).toMatch(/hoursRowTappable/)
  expect(page).toMatch(/hoursRowSelected/)
  expect(page).toMatch(/applyHoursRowTap/)
  expect(page).toMatch(/type="button"/)
  expect(page).toMatch(/text-muted/)
  expect(page).toMatch(/hover:bg-surface-soft/)
  expect(page).toMatch(/focus:bg-surface-soft/)
  expect(page).toMatch(/bg-surface-soft/)
  expect(page).not.toMatch(/md:grid-cols-2/)

  const aside = page.slice(page.indexOf('SALON_BOOKING_ASIDE_CLASS'), page.indexOf('SALON_BOOKING_MAIN_CLASS'))
  expect(aside).not.toMatch(/hoursRowClosed|salon\.hours|weekday/)

  const tapStart = page.indexOf('function onHoursTap')
  const tapEnd = page.indexOf('function bookingInput')
  const tap = page.slice(tapStart, tapEnd)
  expect(tap).toMatch(/applyHoursRowTap/)
  expect(tap).toMatch(/openIntake\('picker'\)/)
  expect(tap).toMatch(/setPreferredDate\(next\.preferredDate\)/)
  expect(tap).not.toMatch(/chatSelected|setChatDate|setChatTime|setChatWorker|clearIntakeToken|pingIntake|onPing/)
})

test('picker scroll is ref plus effect; chat alternate does not scroll', () => {
  const page = read('pages/SalonProfile.tsx')
  expect(page).toMatch(/pickerFormRef = useRef<HTMLFormElement>\(null\)/)
  expect(page).toMatch(/pickerFormRef\.current\?\.scrollIntoView\(\)/)
  expect(page).toMatch(/<form ref=\{pickerFormRef\}/)
  const askAt = page.indexOf("t('assistant.ask')")
  const chatClick = page.slice(askAt - 220, askAt)
  expect(chatClick).toMatch(/openIntake\('chat'\)/)
  expect(chatClick).not.toMatch(/setScrollPicker/)
})

test('loading and missing salon skip the booking split', () => {
  const page = read('pages/SalonProfile.tsx')
  const loading = page.slice(page.indexOf('if (loading)'), page.indexOf('const salon = data?.salon'))
  expect(loading).toMatch(/GUEST_COLUMN_CLASS/)
  expect(loading).not.toMatch(/SALON_BOOKING_SPLIT_CLASS/)
  const missing = page.slice(page.indexOf('if (!salon)'), page.indexOf('const token = busyToken'))
  expect(missing).toMatch(/GUEST_COLUMN_CLASS/)
  expect(missing).not.toMatch(/SALON_BOOKING_SPLIT_CLASS/)
})
