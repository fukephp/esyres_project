// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

const forbiddenChrome = /auth\.login|auth\.register|home\.getPanel|home\.panel|home\.logout|nav\.bookings/

test('TopNav is full-bleed Cal bar with mark link home and panel primary', () => {
  const nav = read('components/TopNav.tsx')
  expect(nav).toMatch(/w-full/)
  expect(nav).toMatch(/bg-canvas/)
  expect(nav).toMatch(/text-ink/)
  expect(nav).toMatch(/border-b border-hairline/)
  expect(nav).toMatch(/min-h-16/)
  expect(nav).toMatch(/flex-wrap/)
  expect(nav).not.toMatch(/\bsticky\b/)
  expect(nav).not.toMatch(/\bfixed\b/)
  expect(nav).toMatch(/\/esyres-mark\.svg/)
  expect(nav).toMatch(/width=\{24\}/)
  expect(nav).toMatch(/to=\{chrome\.brand\.to\}/)
  expect(nav).toMatch(/h-10 items-center rounded-md bg-ink/)
  expect(nav).toMatch(/text-canvas/)
  expect(nav).toMatch(/text-sm text-body/)
  expect(nav).toMatch(/nav\.bookings/)
  expect(nav).toMatch(/home\.getPanel/)
  expect(nav).toMatch(/home\.panel/)
  expect(nav).toMatch(/home\.logout/)
  expect(nav).not.toMatch(/hamburger/)
  expect(nav).not.toMatch(/mega-menu/)
  expect(nav).not.toMatch(/country/)
})

test('Homepage uses TopNav; AuthShell under bar; hero and footer stay constrained', () => {
  const page = read('pages/Homepage.tsx')
  expect(page).toMatch(/<TopNav/)
  expect(page).toMatch(/AuthShell/)
  expect(page).toMatch(/pitch\.h1/)
  expect(page).toMatch(/pitch\.cta/)
  expect(page).toMatch(/home\.footerCity/)
  expect(page).toMatch(/home\.footerLine/)
  expect(page).toMatch(/max-w-3xl/)
  expect(page).not.toMatch(/navigate\('\/owner'\)/)
  expect(page).not.toMatch(/nav\.bookings/)
})

test('discovery and salon share TopNav discovery slot; no in-page BookingsLink', () => {
  const discovery = read('pages/DiscoveryHome.tsx')
  expect(discovery).toMatch(/<TopNav/)
  expect(discovery).toMatch(/<main className="mx-auto max-w-md px-5 py-8">/)
  expect(discovery).not.toMatch(/BookingsLink/)
  expect(discovery).not.toMatch(/esyres-mark/)
  expect(discovery).not.toMatch(forbiddenChrome)
  expect(discovery).not.toMatch(/pitch\.h1/)
  expect(discovery).not.toMatch(/home\.footer/)

  const salon = read('pages/SalonProfile.tsx')
  expect(salon).toMatch(/<TopNav/)
  expect(salon).toMatch(/<main className="mx-auto max-w-md px-5 py-8">/)
  expect(salon).not.toMatch(/BookingsLink/)
  expect(salon).toMatch(/salon\.name/)
  expect(salon).toMatch(/salon\.busy/)
  expect(salon).not.toMatch(forbiddenChrome)
  expect(salon).not.toMatch(/pitch\.h1/)
  expect(salon).not.toMatch(/home\.footer/)
})

test('create-salon empty slot; no Brand duplicate or owner chrome', () => {
  const page = read('pages/CreateSalon.tsx')
  expect(page).toMatch(/<TopNav/)
  expect(page).not.toMatch(/function Brand/)
  expect(page).not.toMatch(/OwnerNav/)
  expect(page).not.toMatch(/home\.getPanel/)
  expect(page).not.toMatch(/home\.panel/)
  expect(page).not.toMatch(/pitch\.h1/)
  expect(page).not.toMatch(/home\.footer/)
  expect(page).not.toMatch(/nav\.bookings/)
})

test('bookings TopNav; AuthShell in page; no bottom Odjava or panel CTA', () => {
  const page = read('pages/MyBookings.tsx')
  expect(page).toMatch(/<TopNav/)
  expect(page).toMatch(/AuthShell/)
  expect(page).not.toMatch(/bookings\.logout/)
  expect(page).not.toMatch(/home\.getPanel/)
  expect(page).not.toMatch(/home\.panel/)
  expect(page).not.toMatch(/nav\.bookings/)
  expect(page).not.toMatch(/pitch\.h1/)
  expect(page).not.toMatch(/home\.footer/)
})

test('owner overlay TopNav above aside+main; OwnerNav stays; no bookings or panel CTA', () => {
  const files = [
    'pages/OwnerHome.tsx',
    'pages/OwnerChats.tsx',
    'pages/OwnerStats.tsx',
    'pages/OwnerRequestDetail.tsx',
  ]
  for (const file of files) {
    const text = read(file)
    expect(text, file).toMatch(/<TopNav/)
    expect(text, file).toMatch(/min-h-svh md:flex/)
    expect(text, file).not.toMatch(/nav\.bookings/)
    expect(text, file).not.toMatch(/home\.getPanel/)
    expect(text, file).not.toMatch(/home\.panel/)
    expect(text, file).not.toMatch(/pitch\.h1/)
    expect(text, file).not.toMatch(/home\.footer/)
    expect(text, file).not.toMatch(/pitch\.cta/)
  }
  expect(read('pages/OwnerHome.tsx')).toMatch(/<OwnerNav/)
  expect(read('pages/OwnerChats.tsx')).toMatch(/<OwnerNav/)
  expect(read('pages/OwnerStats.tsx')).toMatch(/<OwnerNav/)
  expect(read('components/OwnerNav.tsx')).toMatch(/owner\.title/)
})
