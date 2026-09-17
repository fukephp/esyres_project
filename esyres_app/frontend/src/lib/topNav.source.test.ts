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

test('homepagePersonName source does not read email', () => {
  const homepage = read('lib/homepage.ts')
  const personFn = homepage.match(/export function homepagePersonName[\s\S]*?\nexport function topNavChrome/)?.[0]
  expect(personFn).toBeTruthy()
  expect(personFn).not.toMatch(/email/)
  expect(homepage).not.toMatch(/homepageDisplayName/)
  expect(homepage).not.toMatch(/displayName/)
})

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
  expect(nav).toMatch(/nav\.welcome/)
  expect(nav).toMatch(/nav\.bookings/)
  expect(nav).toMatch(/home\.getPanel/)
  expect(nav).toMatch(/home\.panel/)
  expect(nav).toMatch(/home\.logout/)
  expect(nav).toMatch(/GUEST_COLUMN_CLASS/)
  expect(nav).toMatch(/isOwnerPath/)
  expect(nav).toMatch(/px-5 md:px-16/)
  expect(nav).not.toMatch(/hamburger/)
  expect(nav).not.toMatch(/mega-menu/)
  expect(nav).not.toMatch(/country/)
})

test('Odjava uses Cal button-destructive on both logged-in slots', () => {
  const nav = read('components/TopNav.tsx')
  const logoutClass = nav.match(/const logoutClass =\s*'([^']+)'/)?.[1]
  expect(logoutClass).toBe(
    'inline-flex h-10 items-center rounded-md bg-error-strong px-5 text-sm font-semibold text-canvas active:bg-error-strong-active',
  )
  expect(logoutClass).not.toMatch(/hover:/)
  expect(logoutClass).not.toMatch(/rounded-full/)
  expect(logoutClass).not.toMatch(/busy-busy/)
  expect(logoutClass).not.toMatch(/bg-ink/)
  expect(nav).toMatch(/LOGOUT_MUTATION/)
  expect(nav).not.toMatch(/window\.confirm|confirm\(/)

  const logoutButtons = [
    ...nav.matchAll(/<button type="button" className=\{(\w+)\} onClick=\{\(\) => void logout\(\)\}>/g),
  ]
  expect(logoutButtons).toHaveLength(2)
  for (const match of logoutButtons) {
    expect(match[1]).toBe('logoutClass')
  }

  const homeSession = nav.match(/chrome\.slot === 'home-session'[\s\S]*?(?=chrome\.slot === 'discovery')/)?.[0]
  expect(homeSession).toMatch(/nav\.welcome[\s\S]*nav\.bookings[\s\S]*home\.logout[\s\S]*panelClass/)
  expect(homeSession).toMatch(/className=\{linkClass\}>\{t\('nav\.welcome', \{ name: chrome\.personName \}\)/)
  expect(homeSession).not.toMatch(/chrome\.displayName/)
  expect(homeSession).toMatch(/to=\{BOOKINGS_HREF\}[\s\S]*nav\.bookings/)
  expect(nav).toMatch(/<button type="button" className=\{linkClass\} onClick=\{onLogin\}>/)
  expect(nav).toMatch(/<button type="button" className=\{linkClass\} onClick=\{onRegister\}>/)

  const discoverySlot = nav.match(/chrome\.slot === 'discovery'[\s\S]*?(?=chrome\.slot === 'session')/)?.[0]
  expect(discoverySlot).toMatch(/nav\.welcome[\s\S]*nav\.bookings/)
  expect(discoverySlot).not.toMatch(/logoutClass/)
  expect(discoverySlot).not.toMatch(/panelClass/)

  const sessionSlot = nav.match(/chrome\.slot === 'session'[\s\S]*?(?=chrome\.slot === 'greeting')/)?.[0]
  expect(sessionSlot).toMatch(/nav\.welcome[\s\S]*logoutClass/)
  expect(sessionSlot).not.toMatch(/nav\.bookings/)
  expect(sessionSlot).not.toMatch(/panelClass/)

  const greetingSlot = nav.match(/chrome\.slot === 'greeting'[\s\S]*?(?=<\/nav>)/)?.[0]
  expect(greetingSlot).toMatch(/nav\.welcome/)
  expect(greetingSlot).not.toMatch(/nav\.bookings/)
  expect(greetingSlot).not.toMatch(/logoutClass/)
  expect(greetingSlot).not.toMatch(/panelClass/)
  expect(nav).toMatch(/chrome\.slot === 'empty' \? null/)

  const css = read('index.css')
  expect(css).toMatch(/--color-error-strong:\s*#dc2626/)
  expect(css).toMatch(/--color-error-strong-active:\s*#b91c1c/)
  expect(css).toMatch(/--color-error:\s*#ef4444/)
  expect(css).not.toMatch(/--color-on-primary/)
})

test('Homepage uses TopNav; AuthShell under bar; hero and footer stay constrained', () => {
  const page = read('pages/Homepage.tsx')
  expect(page).toMatch(/<TopNav/)
  expect(page).toMatch(/AuthShell/)
  expect(page).toMatch(/nextHomepageAuth/)
  expect(page).toMatch(/PLACE_HEADING_CLASS/)
  expect(page).toMatch(/auth\.placeCustomer/)
  expect(page).toMatch(/authOpen \?/)
  expect(page).toMatch(/pitch\.h1/)
  expect(page).toMatch(/pitch\.cta/)
  expect(page).toMatch(/home\.footerCity/)
  expect(page).toMatch(/home\.footerLine/)
  expect(page).toMatch(/GUEST_COLUMN_CLASS/)
  expect(page).not.toMatch(/max-w-3xl/)
  expect(page).toMatch(/max-w-xl/)
  expect(page).toMatch(/max-w-sm/)
  expect(page).toMatch(/w-fit/)
  expect(page).not.toMatch(/navigate\('\/owner'\)/)
  expect(page).not.toMatch(/nav\.bookings/)
  expect(page).toMatch(/PLACE_HEADING_CLASS\}>\{t\('auth\.placeCustomer'\)\}[\s\S]*max-w-sm[\s\S]*AuthShell/)
  expect(page).not.toMatch(/max-w-sm[\s\S]*PLACE_HEADING_CLASS/)
})

function topNavTags(text: string): string[] {
  return [...text.matchAll(/<TopNav[\s\S]*?\/>/g)].map((m) => m[0])
}

test('discovery and salon share TopNav discovery slot; no in-page BookingsLink', () => {
  const discovery = read('pages/DiscoveryHome.tsx')
  expect(discovery).toMatch(/<TopNav/)
  expect(discovery).toMatch(/ME_QUERY/)
  expect(discovery).toMatch(/GUEST_COLUMN_CLASS/)
  expect(discovery).not.toMatch(/mx-auto max-w-md/)
  expect(discovery).not.toMatch(/md:grid/)
  expect(discovery).toMatch(/space-y-3/)
  expect(discovery).toMatch(/divide-hairline/)
  expect(discovery).not.toMatch(/BookingsLink/)
  expect(discovery).not.toMatch(/esyres-mark/)
  expect(discovery).not.toMatch(forbiddenChrome)
  expect(discovery).not.toMatch(/pitch\.h1/)
  expect(discovery).not.toMatch(/home\.footer/)
  const discoveryNavs = topNavTags(discovery)
  expect(discoveryNavs.length).toBeGreaterThan(0)
  for (const tag of discoveryNavs) {
    expect(tag).toMatch(/me=/)
    expect(tag).not.toMatch(/salon\.name/)
  }

  const salon = read('pages/SalonProfile.tsx')
  expect(salon).toMatch(/<TopNav/)
  expect(salon).toMatch(/ME_QUERY/)
  expect(salon).toMatch(/GUEST_COLUMN_CLASS/)
  expect(salon).not.toMatch(/mx-auto max-w-md/)
  expect(salon).toMatch(/SALON_PICKER_DIALOG_CLASS/)
  expect(salon).not.toMatch(/md:grid-cols-2/)
  expect(salon).not.toMatch(/BookingsLink/)
  expect(salon).toMatch(/salon\.name/)
  expect(salon).toMatch(/salon\.busy/)
  expect(salon).not.toMatch(forbiddenChrome)
  expect(salon).not.toMatch(/pitch\.h1/)
  expect(salon).not.toMatch(/home\.footer/)
  const salonNavs = topNavTags(salon)
  expect(salonNavs.length).toBe(3)
  for (const tag of salonNavs) {
    expect(tag).toMatch(/me=/)
    expect(tag).not.toMatch(/salon\.name/)
  }
  const chatDialog = salon.slice(salon.lastIndexOf('<dialog'))
  expect(chatDialog).toMatch(/salon\.close/)
  expect(chatDialog).not.toMatch(/nav\.welcome/)
  expect(read('components/AssistantIntake.tsx')).not.toMatch(/nav\.welcome/)
})

test('create-salon empty slot; no Brand duplicate or owner chrome', () => {
  const page = read('pages/CreateSalon.tsx')
  expect(page).toMatch(/<TopNav/)
  expect(page).toMatch(/ME_QUERY/)
  expect(page).toMatch(/GUEST_COLUMN_CLASS/)
  expect(page).not.toMatch(/mx-auto max-w-md/)
  expect(page).toMatch(/max-w-md/)
  expect(page).not.toMatch(/function Brand/)
  expect(page).not.toMatch(/OwnerNav/)
  expect(page).not.toMatch(/home\.getPanel/)
  expect(page).not.toMatch(/home\.panel/)
  expect(page).not.toMatch(/pitch\.h1/)
  expect(page).not.toMatch(/home\.footer/)
  expect(page).not.toMatch(/nav\.bookings/)
  const createNavs = topNavTags(page)
  expect(createNavs.length).toBe(4)
  for (const tag of createNavs) {
    expect(tag).toMatch(/me=/)
  }
})

test('bookings TopNav; AuthShell in page; no bottom Odjava or panel CTA', () => {
  const page = read('pages/MyBookings.tsx')
  expect(page).toMatch(/<TopNav/)
  expect(page).toMatch(/GUEST_COLUMN_CLASS/)
  expect(page).not.toMatch(/mx-auto max-w-md/)
  expect(page).toMatch(/max-w-md/)
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
    'pages/OwnerSalons.tsx',
    'pages/OwnerSalonCreate.tsx',
    'pages/OwnerSalonEdit.tsx',
  ]
  for (const file of files) {
    const text = read(file)
    expect(text, file).toMatch(/<TopNav/)
    expect(text, file).toMatch(/min-h-svh md:flex/)
    expect(text, file).not.toMatch(/GUEST_COLUMN_CLASS/)
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
  expect(read('pages/OwnerRequestDetail.tsx')).toMatch(/<OwnerNav/)
  expect(read('pages/OwnerSalons.tsx')).toMatch(/<OwnerNav/)
  expect(read('pages/OwnerSalonCreate.tsx')).toMatch(/<OwnerNav/)
  expect(read('pages/OwnerSalonEdit.tsx')).toMatch(/<OwnerNav/)
  expect(read('components/OwnerNav.tsx')).toMatch(/owner\.title/)
  expect(read('components/OwnerNav.tsx')).toMatch(/owner\.salons/)
})
