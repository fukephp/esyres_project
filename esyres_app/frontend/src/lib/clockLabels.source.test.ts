// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

const pages = [
  'pages/OwnerHome.tsx',
  'components/OwnerBoards.tsx',
  'pages/OwnerRequestDetail.tsx',
  'pages/OwnerZapisi.tsx',
  'pages/MyBookings.tsx',
]

test('booking clocks render server labels', () => {
  for (const page of pages) {
    const source = read(page)
    expect(source, page).not.toMatch(/formatSarajevoTime/)
    expect(source, page).not.toMatch(/formatSarajevoDateTime/)
  }

  expect(read('pages/OwnerHome.tsx')).toMatch(/queueRowLabel/)
  expect(read('components/OwnerBoards.tsx')).toMatch(/bookingStartLabel/)
  expect(read('pages/OwnerZapisi.tsx')).toMatch(/bookingStartLabel/)
  expect(read('pages/OwnerRequestDetail.tsx')).toMatch(/preferredStartsAtLabel/)
  expect(read('pages/OwnerRequestDetail.tsx')).toMatch(/proposedStartsAtLabel/)
  const bookings = read('pages/MyBookings.tsx')
  expect(bookings).toMatch(/formatCivilDate/)
  expect(bookings).toMatch(/proposedDate/)
  expect(bookings).toMatch(/proposedStartsAtLabel/)
  expect(bookings).toMatch(/preferredStartsAtLabel/)
  expect(bookings).toMatch(/rescheduleDate/)
  expect(bookings).toMatch(/rescheduleStartsAtLabel/)
})
