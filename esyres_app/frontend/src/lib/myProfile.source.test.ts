// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { topNavChrome } from './homepage'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

const page = read('pages/MyProfile.tsx')
const bookings = read('pages/MyBookings.tsx')
const nav = read('components/TopNav.tsx')
const app = read('App.tsx')

test('guest profile is the customer auth shell and the logged-in page shows the newest booking', () => {
  expect(page).toMatch(/AuthShell place="customer"/)
  expect(page).toMatch(/myBookings\[0\]/)
  expect(page).toMatch(/row\.salon\.name/)
  expect(page).toMatch(/bookings\.status/)
  expect(page).toMatch(/preferredDate/)
  expect(page).toMatch(/bookings\.empty/)
  expect(page).toMatch(/bookings\.seeAll/)
  expect(page).toMatch(/BOOKINGS_HREF/)
  expect(page).toMatch(/\/settings/)
  expect(page).not.toMatch(/Ocijeni/)
  expect(bookings).not.toMatch(/Ocijeni/)
})

test('Profil sits before Moje rezervacije on customer routes and not on owner or create-salon', () => {
  const ana = { name: 'Ana', email: 'a@b.c', salons: [] }
  expect(topNavChrome('/', ana).slot === 'home-session' && topNavChrome('/', ana)).toMatchObject({ profile: true })
  expect(topNavChrome('/salons', ana)).toMatchObject({ profile: true })
  expect(topNavChrome('/salon/1', ana)).toMatchObject({ profile: true })
  expect(topNavChrome('/bookings', ana).slot).toBe('customer-session')
  expect(topNavChrome('/my-profile', ana).slot).toBe('customer-session')
  expect(topNavChrome('/my-profile/settings', ana).slot).toBe('customer-session')
  expect(topNavChrome('/owner', ana)).not.toHaveProperty('profile')
  expect(topNavChrome('/create-salon', ana).slot).toBe('greeting')
  expect(nav).toMatch(/nav\.profile[\s\S]*nav\.bookings/)
  expect(app).toMatch(/path="\/my-profile" element=\{customer\(<MyProfile/)
})
