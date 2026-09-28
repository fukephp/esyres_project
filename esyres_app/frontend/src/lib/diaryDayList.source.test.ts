// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')
const GRID = 'grid-cols-[3.5rem_minmax(0,1fr)]'

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

function sliceFn(source: string, name: string): string {
  const start = source.indexOf(`function ${name}`)
  const next = source.indexOf('\nfunction ', start + 1)
  return source.slice(start, next === -1 ? undefined : next)
}

test('day heading is Inter; month title stays Cal Sans', () => {
  const home = read('pages/OwnerHome.tsx')
  expect(home).toMatch(/<h3 className="text-lg font-semibold tracking-tight text-ink">/)
  expect(home).toMatch(/<h2 className="font-display text-lg font-semibold tracking-tight text-ink">/)
  const h3 = home.slice(home.indexOf('<h3'), home.indexOf('</h3>'))
  expect(h3).not.toMatch(/font-display/)
})

test('pending and occupying share one clock gutter', () => {
  const home = read('pages/OwnerHome.tsx')
  const pending = sliceFn(home, 'QueueRow')
  const occupying = sliceFn(home, 'OccupyingRow')
  expect(pending).toMatch(GRID)
  expect(occupying).toMatch(GRID)
  expect(pending).not.toMatch(/md:grid-cols-/)
  expect(occupying).not.toMatch(/md:grid-cols-/)

  const cardAt = pending.indexOf('bg-surface-soft')
  expect(pending.indexOf('formatSarajevoTime(clock)')).toBeGreaterThan(-1)
  expect(pending.indexOf('formatSarajevoTime(clock)')).toBeLessThan(cardAt)
  expect(pending.slice(cardAt)).not.toMatch(/formatSarajevoTime/)
  expect(pending.slice(cardAt)).toMatch(/salon\.duration/)
  expect(pending.slice(cardAt)).toMatch(/salon\.noPreference/)
  expect(pending).toMatch(/queueChipInitial/)
  expect(pending).toMatch(/owner\.reschedule/)
  expect(pending).toMatch(/owner\.assistant/)
  expect(pending).toMatch(/owner\.soon/)
  expect(pending).toMatch(/owner\.accept/)
  expect(pending).toMatch(/owner\.propose/)
  expect(pending).toMatch(/owner\.decline/)
  expect(pending).toMatch(/owner\.keepOriginal/)
  expect(pending).toMatch(/rounded-lg border border-hairline bg-surface-soft/)

  const link = occupying.match(/<Link[\s\S]*?className="([^"]+)"/)
  expect(link?.[1]).toMatch(/border-b border-hairline/)
  expect(link?.[1]).not.toMatch(/(?:^|\s)border border-hairline/)
  expect(link?.[1]).not.toMatch(/\bpx-3\b/)
  expect(occupying).toMatch(/occupyingDiaryMeta/)
  expect(occupying).toMatch(/\/owner\/requests\//)
  expect(occupying).toMatch(/bookings\.status\.TIME_PROPOSED/)
  expect(occupying).toMatch(/owner\.noShow/)
  expect(occupying).toMatch(/block\.label/)
  expect(occupying).toMatch(/workerDotColor/)
})

test('break, closed, and soon heading have no clock gutter', () => {
  const home = read('pages/OwnerHome.tsx')
  const breakP = home.slice(home.indexOf('<p key="break"'), home.indexOf('</p>', home.indexOf('<p key="break"')))
  expect(breakP).toMatch(/owner\.break/)
  expect(breakP).not.toMatch(GRID)
  const closedAt = home.indexOf('owner.closedDay')
  const closedP = home.slice(home.lastIndexOf('<p', closedAt), home.indexOf('</p>', closedAt))
  expect(closedP).not.toMatch(GRID)
  expect(home).toMatch(/<h4 className="mt-4 text-sm font-semibold text-ink">\{t\('owner\.soon'\)\}<\/h4>/)
})
