// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

const app = read('App.tsx')
const css = read('index.css')
const main = read('main.tsx')

test('customer routes use the card pack and owner routes do not', () => {
  expect(css).toMatch(/\.customer-surface[\s\S]*#e8eef3/)
  expect(css).toMatch(/#ffffff/)
  expect(css).toMatch(/#14181f/)
  expect(css).toMatch(/#5c6770/)
  expect(css).toMatch(/#e3e7eb/)
  expect(css).toMatch(/#2f6fed/)
  expect(css).toMatch(/border-radius:\s*20px/)
  expect(css).toMatch(/0 8px 30px rgba\(20,\s*24,\s*31,\s*0\.06\)/)
  expect(css).toMatch(/Inter Variable/)
  expect(main).toMatch(/@fontsource-variable\/inter/)

  for (const path of ['path="/"', 'path="/salons"', 'path="/salon/:id"', 'path="/bookings"']) {
    const line = app.split('\n').find((row) => row.includes(path))
    expect(line, path).toMatch(/customer\(/)
  }
  for (const path of ['CREATE_SALON_PATH', 'path="/owner"']) {
    const line = app.split('\n').find((row) => row.includes(path) && row.includes('element='))
    expect(line, path).not.toMatch(/customer\(/)
  }
})

test('logout stays the red pill and customer pages do not add profile, save, or rating', () => {
  const nav = read('components/TopNav.tsx')
  expect(nav).toMatch(/bg-error-strong/)
  expect(nav).toMatch(/rounded-full/)
  expect(nav).not.toMatch(/Profil/)
  const home = read('pages/Homepage.tsx')
  expect(home).toMatch(/home\.howTitle/)
  expect(home).toMatch(/home\.popularTitle/)
  expect(home).toMatch(/home\.faqTitle/)
  expect(home).not.toMatch(/Sačuvaj|Ocijeni/)
  expect(read('pages/SalonProfile.tsx')).not.toMatch(/Sačuvaj|Ocijeni/)
  expect(read('pages/MyBookings.tsx')).not.toMatch(/Ocijeni/)
})
