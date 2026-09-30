// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

function sliceFn(source: string, name: string): string {
  const start = source.indexOf(`function ${name}`)
  const next = source.indexOf('\nfunction ', start + 1)
  return source.slice(start, next === -1 ? undefined : next)
}

test('week title is display; day title is body font', () => {
  const home = read('pages/OwnerHome.tsx')
  const boards = read('components/OwnerBoards.tsx')
  expect(boards).toMatch(/<h2 className="font-display text-lg font-semibold tracking-tight text-ink">/)
  const h3 = home.slice(home.indexOf('<h3'), home.indexOf('</h3>'))
  expect(h3).toMatch(/text-lg font-semibold tracking-tight text-ink/)
  expect(h3).not.toMatch(/font-display/)
})

test('pending queue rows are pink cards with the clock inside', () => {
  const pending = sliceFn(read('pages/OwnerHome.tsx'), 'QueueRow')
  expect(pending).toMatch(/rounded-2xl bg-status-pending/)
  expect(pending).not.toMatch(/grid-cols-\[3\.5rem/)
  expect(pending).toMatch(/queueRowLabel\(row\)/)
  expect(pending).toMatch(/salon\.duration/)
  expect(pending).toMatch(/salon\.noPreference/)
  expect(pending).toMatch(/queueChipInitial/)
  expect(pending).toMatch(/owner\.reschedule/)
  expect(pending).toMatch(/owner\.assistant/)
  expect(pending).toMatch(/owner\.soon/)
  expect(pending).toMatch(/owner\.accept/)
  expect(pending).toMatch(/owner\.propose/)
  expect(pending).toMatch(/owner\.decline/)
  expect(pending).toMatch(/owner\.keepOriginal/)
})

test('occupying and booking cards are pastel links to Request Detail', () => {
  const boards = read('components/OwnerBoards.tsx')
  const occupying = sliceFn(boards, 'OccupyingCard')
  expect(occupying).toMatch(/\/owner\/requests\//)
  expect(occupying).toMatch(/STATUS_CARD_CLASS\[tone\]/)
  expect(occupying).toMatch(/'TIME_PROPOSED' \? 'proposed' : 'confirmed'/)
  expect(occupying).toMatch(/row\.customerName/)
  expect(occupying).toMatch(/block\.label/)
  expect(occupying).toMatch(/workerDotColor/)
  expect(occupying).toMatch(/salon\.noPreference/)
  const booking = sliceFn(boards, 'BookingCard')
  expect(booking).toMatch(/kanbanColumn\(row, now\)/)
  expect(booking).toMatch(/STATUS_CARD_CLASS\[column\]/)
  expect(booking).toMatch(/<Link to=\{to\}/)
})
