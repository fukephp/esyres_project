// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('ME_QUERY loads salon hours; no new GraphQL openNow field', () => {
  const auth = read('graphql/auth.ts')
  expect(auth).toMatch(/query Me \{[\s\S]*salons \{[\s\S]*hours \{[\s\S]*weekday[\s\S]*closed[\s\S]*opensAt[\s\S]*closesAt[\s\S]*breakStartsAt[\s\S]*breakEndsAt/)
  expect(auth).not.toMatch(/openNow/)
})

test('App lazy-loads /owner/salons and does not register create or edit', () => {
  const app = read('App.tsx')
  expect(app).toMatch(/const OwnerSalons = lazy\(/)
  expect(app).toMatch(/path="\/owner\/salons"/)
  expect(app).not.toMatch(/path="\/owner\/salons\/create"/)
  expect(app).not.toMatch(/path="\/owner\/salons\/:id"/)
})

test('OwnerNav Saloni has no salon query and is on every owner overlay', () => {
  const nav = read('components/OwnerNav.tsx')
  expect(nav).toMatch(/OWNER_SALONS_PATH/)
  expect(nav).toMatch(/active === 'salons'/)
  expect(nav).toMatch(/owner\.salons/)
  expect(nav).not.toMatch(/\?salon=/)
  for (const file of [
    'pages/OwnerHome.tsx',
    'pages/OwnerChats.tsx',
    'pages/OwnerStats.tsx',
    'pages/OwnerRequestDetail.tsx',
    'pages/OwnerSalons.tsx',
  ]) {
    expect(read(file), file).toMatch(/<OwnerNav/)
  }
})

test('catalog overlay has no switcher or row links; not-owner keeps create-salon', () => {
  const page = read('pages/OwnerSalons.tsx')
  expect(page).toMatch(/owner\.notOwner/)
  expect(page).toMatch(/CREATE_SALON_PATH/)
  expect(page).toMatch(/owner\.createSalon/)
  expect(page).toMatch(/owner\.openNow/)
  expect(page).toMatch(/owner\.closedNow/)
  expect(page).toMatch(/salonIsOpenNow/)
  expect(page).toMatch(/<ul className="mt-8 max-w-xl divide-y divide-hairline/)
  expect(page).not.toMatch(/<select/)
  expect(page).not.toMatch(/t\('owner\.salon'\)/)
  expect(page).not.toMatch(/\?salon=/)
  expect(page).not.toMatch(/\/owner\/salons\//)
  expect(page).not.toMatch(/navigate\(/)
})

test('request detail has OwnerNav and no salon switcher', () => {
  const page = read('pages/OwnerRequestDetail.tsx')
  expect(page).toMatch(/<OwnerNav/)
  expect(page).not.toMatch(/t\('owner\.salon'\)/)
  expect(page).not.toMatch(/onSalon/)
})

test('create-salon is unchanged and has no OwnerNav', () => {
  const page = read('pages/CreateSalon.tsx')
  expect(page).not.toMatch(/OwnerNav/)
  expect(page).not.toMatch(/owner\.salons/)
  expect(page).toMatch(/createSalon\.name/)
})
