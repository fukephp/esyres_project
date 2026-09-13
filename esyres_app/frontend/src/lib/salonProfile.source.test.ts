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

test('salon profile stack is address, header send, hours, services, lower CTAs', () => {
  const page = read('pages/SalonProfile.tsx')
  const nameAt = page.indexOf('{salon.name}')
  const addressAt = page.indexOf('{addressLine}')
  const headerIdleAt = page.indexOf('hasServices && mode === \'idle\'')
  const hoursAt = page.indexOf("t('salon.hours')")
  const servicesAt = page.indexOf("t('salon.services')")
  const lowerAt = page.indexOf('hasServices && !picking && !sent')
  const askAt = page.indexOf("t('assistant.ask')")

  expect(nameAt).toBeGreaterThan(-1)
  expect(addressAt).toBeGreaterThan(nameAt)
  expect(headerIdleAt).toBeGreaterThan(addressAt)
  expect(hoursAt).toBeGreaterThan(headerIdleAt)
  expect(servicesAt).toBeGreaterThan(hoursAt)
  expect(lowerAt).toBeGreaterThan(servicesAt)
  expect(askAt).toBeGreaterThan(lowerAt)
})

test('address is omitted helper plus muted line; no maps heading', () => {
  const page = read('pages/SalonProfile.tsx')
  expect(page).toMatch(/assistantAddressLine\(salon\.address\)/)
  expect(page).toMatch(/addressLine !== null \? <p className="mt-3 text-sm text-muted">\{addressLine\}<\/p>/)
  expect(page).not.toMatch(/Adresa/)
  expect(page).not.toMatch(/maps\.google/)
  expect(page).not.toMatch(/\blat\b|\blng\b/)
})

test('header send is idle ink pill in max-w-md; lower send still shows during chat', () => {
  const page = read('pages/SalonProfile.tsx')
  expect(page).toMatch(/hasServices && mode === 'idle'[\s\S]*max-w-md[\s\S]*w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas[\s\S]*openIntake\('picker'\)[\s\S]*setScrollPicker\(true\)[\s\S]*salon\.send/)
  expect(page).toMatch(/hasServices && !picking && !sent[\s\S]*openIntake\('picker'\)[\s\S]*salon\.send/)
  expect(page).toMatch(/showChatCta\(salon\.services\.length, sent\) && !chatting/)
  expect(page).not.toMatch(/\bsticky\b/)
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
