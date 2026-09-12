// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('busy and cell CSS variables keep Design 1 hexes; display is Cal Sans', () => {
  const css = read('index.css')
  expect(css).toMatch(/--color-busy-free:\s*#22c55e/)
  expect(css).toMatch(/--color-busy-moderate:\s*#eab308/)
  expect(css).toMatch(/--color-busy-busy:\s*#ef4444/)
  expect(css).toMatch(/--color-cell-free:\s*#86efac/)
  expect(css).toMatch(/--color-cell-pending:\s*#fcd34d/)
  expect(css).toMatch(/--color-cell-proposed:\s*#93c5fd/)
  expect(css).toMatch(/--color-cell-booked:\s*#1a1a1a/)
  expect(css).toMatch(/--color-cell-off:\s*#d6d3d1/)
  expect(css).toMatch(/--font-display:\s*"Cal Sans", Inter, ui-sans-serif, system-ui, sans-serif/)
  expect(css).toMatch(/--font-sans:\s*Inter, ui-sans-serif, system-ui, sans-serif/)
})

test('owner chrome is Cal light; no dark nav', () => {
  const files = [
    'components/OwnerNav.tsx',
    'pages/OwnerHome.tsx',
    'pages/OwnerChats.tsx',
    'pages/OwnerStats.tsx',
    'pages/OwnerRequestDetail.tsx',
  ]
  for (const file of files) {
    const text = read(file)
    expect(text, file).not.toMatch(/bg-surface-dark/)
    expect(text, file).not.toMatch(/text-on-dark/)
    expect(text, file).not.toMatch(/md:bg-surface-dark/)
    expect(text, file).not.toMatch(/tone=/)
    expect(text, file).not.toMatch(/CompanyPitch/)
    expect(text, file).not.toMatch(/company-pitch/)
    expect(text, file).not.toMatch(/['"]pitch\./)
  }

  const nav = read('components/OwnerNav.tsx')
  expect(nav).not.toMatch(/\btone\b/)
  expect(nav).toMatch(/text-body/)
  expect(nav).toMatch(/font-semibold text-ink/)
  expect(nav).toMatch(/bg-ink text-canvas/)

  for (const file of [
    'pages/OwnerHome.tsx',
    'pages/OwnerChats.tsx',
    'pages/OwnerStats.tsx',
    'pages/OwnerRequestDetail.tsx',
  ]) {
    const text = read(file)
    expect(text, file).toMatch(/bg-canvas/)
    expect(text, file).toMatch(/text-ink/)
    expect(text, file).toMatch(/border-hairline/)
  }
})

test('dense panel stays queue then 15-minute WorkerPanel', () => {
  const panel = read('components/WorkerPanel.tsx')
  expect(panel).toMatch(/<table/)
  expect(panel).toMatch(/bg-cell-free/)
  expect(panel).toMatch(/bg-cell-off/)
  expect(panel).toMatch(/bg-cell-booked/)
  expect(panel).toMatch(/bg-cell-proposed/)

  const home = read('pages/OwnerHome.tsx')
  const queueAt = home.indexOf('<ul className="mt-8 max-w-xl space-y-3">')
  const panelAt = home.indexOf('<WorkerPanel')
  expect(queueAt).toBeGreaterThan(-1)
  expect(panelAt).toBeGreaterThan(queueAt)
})

test('discovery and salon stay sparse; no homepage IA', () => {
  const discovery = read('pages/DiscoveryHome.tsx')
  expect(discovery).toMatch(/GUEST_COLUMN_CLASS/)
  expect(discovery).not.toMatch(/mx-auto max-w-md/)
  expect(discovery).toMatch(/<TopNav/)
  expect(discovery).not.toMatch(/CompanyPitch/)
  expect(discovery).not.toMatch(/company-pitch/)
  expect(discovery).not.toMatch(/['"]pitch\./)

  const salon = read('pages/SalonProfile.tsx')
  expect(salon).toMatch(/GUEST_COLUMN_CLASS/)
  expect(salon).not.toMatch(/mx-auto max-w-md/)
  expect(salon).toMatch(/<TopNav/)
  expect(salon).not.toMatch(/CompanyPitch/)
  expect(salon).not.toMatch(/company-pitch/)
  expect(salon).not.toMatch(/['"]pitch\./)
})
