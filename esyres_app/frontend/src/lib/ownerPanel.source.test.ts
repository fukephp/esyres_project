// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('occupying query asks for snapshot service names', () => {
  const pending = read('graphql/pending.ts')
  expect(pending).toMatch(/query OccupyingBookings\([\s\S]*services \{\s*name\s*\}/)
})

test('WorkerPanel spans occupying cells with truncated job label', () => {
  const panel = read('components/WorkerPanel.tsx')
  expect(panel).toMatch(/colSpan/)
  expect(panel).toMatch(/truncate/)
  expect(panel).toMatch(/text-xs/)
  expect(panel).toMatch(/h-8/)
  expect(panel).not.toMatch(/whitespace-pre-wrap/)
  expect(panel).not.toMatch(/h-10/)
  expect(panel).not.toMatch(/now-only|now strip|NowStrip/)
  expect(panel).toMatch(/bg-cell-booked/)
  expect(panel).toMatch(/text-canvas/)
  expect(panel).toMatch(/bg-cell-proposed/)
  expect(panel).toMatch(/text-ink/)
  expect(panel).toMatch(/bg-cell-free/)
  expect(panel).toMatch(/bg-cell-off/)
  expect(panel).toMatch(/cell:\$\{workerId\}:\$\{time\}/)
})

test('owner home queue stays above WorkerPanel; Request Detail has no panel', () => {
  const home = read('pages/OwnerHome.tsx')
  const queueAt = home.indexOf('<ul className="mt-8 max-w-xl space-y-3">')
  const panelAt = home.indexOf('<WorkerPanel')
  expect(queueAt).toBeGreaterThan(-1)
  expect(panelAt).toBeGreaterThan(queueAt)

  const detail = read('pages/OwnerRequestDetail.tsx')
  expect(detail).not.toMatch(/WorkerPanel/)
})
