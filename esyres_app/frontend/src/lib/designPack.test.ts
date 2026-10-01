// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('Design 2 tokens: cream page, pastels, status, busy unchanged; Bricolage + Manrope', () => {
  const css = read('index.css')
  expect(css).toMatch(/--color-page:\s*#faf4ea/)
  expect(css).toMatch(/--color-canvas:\s*#fffcf6/)
  expect(css).toMatch(/background:\s*var\(--color-page\)/)
  expect(css).toMatch(/--color-pastel-pink:\s*#f5b8db/)
  expect(css).toMatch(/--color-pastel-green:\s*#9aab63/)
  expect(css).toMatch(/--color-pastel-blue:\s*#b6caeb/)
  expect(css).toMatch(/--color-pastel-yellow:\s*#f5d867/)
  expect(css).toMatch(/--color-status-pending:\s*#f5b8db/)
  expect(css).toMatch(/--color-status-proposed:\s*#b6caeb/)
  expect(css).toMatch(/--color-status-confirmed:\s*#f5d867/)
  expect(css).toMatch(/--color-status-done:\s*#efe7da/)
  expect(css).toMatch(/--color-busy-free:\s*#22c55e/)
  expect(css).toMatch(/--color-busy-moderate:\s*#eab308/)
  expect(css).toMatch(/--color-busy-busy:\s*#ef4444/)
  expect(css).toMatch(/--color-error-strong:\s*#dc2626/)
  expect(css).toMatch(/--font-display:\s*"Bricolage Grotesque Variable"/)
  expect(css).toMatch(/--font-sans:\s*"Manrope Variable"/)
  expect(css).not.toMatch(/Cal Sans/)
  expect(css).not.toMatch(/Inter/)

  const main = read('main.tsx')
  expect(main).toMatch(/@fontsource-variable\/bricolage-grotesque/)
  expect(main).toMatch(/@fontsource-variable\/manrope/)
})

test('owner chrome is the Design 2 shell: dark sidebar and dark bottom tabs', () => {
  const shell = read('components/OwnerShell.tsx')
  expect(shell).toMatch(/bg-surface-dark px-4 py-6 text-on-dark/)
  expect(shell).toMatch(/fixed inset-x-0 bottom-0 z-20 bg-surface-dark md:hidden/)
  expect(shell).toMatch(/bg-page/)
  expect(shell).toMatch(/font-display/)
  const nav = read('components/OwnerNav.tsx')
  expect(nav).toMatch(/bg-canvas font-semibold text-ink/)
  expect(nav).toMatch(/text-on-dark-soft/)
  expect(nav).toMatch(/bg-pastel-pink/)

  const files = [
    'pages/OwnerHome.tsx',
    'pages/OwnerChats.tsx',
    'pages/OwnerStats.tsx',
    'pages/OwnerRequestDetail.tsx',
    'pages/OwnerSalons.tsx',
    'pages/OwnerSalonCreate.tsx',
    'pages/OwnerSalonEdit.tsx',
    'pages/OwnerSettings.tsx',
    'pages/OwnerZapisi.tsx',
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

  for (const file of [
    'pages/OwnerHome.tsx',
    'pages/OwnerChats.tsx',
    'pages/OwnerStats.tsx',
    'pages/OwnerSalons.tsx',
    'pages/OwnerSalonCreate.tsx',
    'pages/OwnerSalonEdit.tsx',
    'pages/OwnerSettings.tsx',
    'pages/OwnerZapisi.tsx',
  ]) {
    const text = read(file)
    expect(text, file).toMatch(/bg-canvas/)
    expect(text, file).toMatch(/text-ink/)
    expect(text, file).toMatch(/<OwnerShell/)
  }

  const detail = read('pages/OwnerRequestDetail.tsx')
  expect(detail).toMatch(/bg-canvas/)
  expect(detail).toMatch(/text-ink/)
  expect(detail).toMatch(/<dialog/)
  expect(detail).not.toMatch(/bg-surface-dark/)
  expect(detail).not.toMatch(/text-on-dark/)
  expect(detail).not.toMatch(/CompanyPitch/)
})

test('dense owner home is Kalendar week grid or status Kanban on pastel cards', () => {
  const home = read('pages/OwnerHome.tsx')
  expect(home).toMatch(/rounded-3xl bg-canvas p-4 md:p-6/)
  expect(home).toMatch(/<WeekGrid/)
  expect(home).toMatch(/<KanbanBoard/)
  expect(home).toMatch(/occupyingBookingsRange/)
  expect(home).toMatch(/bg-status-pending/)
  const boards = read('components/OwnerBoards.tsx')
  expect(boards).toMatch(/md:grid-cols-7/)
  expect(boards).toMatch(/md:grid-cols-4/)
  expect(boards).toMatch(/snap-x snap-mandatory/)
  expect(boards).toMatch(/STATUS_CARD_CLASS/)
  expect(boards).not.toMatch(/draggable|@dnd-kit/)
  expect(home).not.toMatch(/WorkerPanel/)
  expect(home).not.toMatch(/@dnd-kit/)
  expect(home).not.toMatch(/bg-cell-free/)
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
  expect(salon).not.toMatch(/md:grid-cols-2/)
  expect(salon).not.toMatch(/hover:bg-surface-soft/)
  expect(salon).toMatch(/<TopNav/)
  expect(salon).not.toMatch(/CompanyPitch/)
  expect(salon).not.toMatch(/company-pitch/)
  expect(salon).not.toMatch(/['"]pitch\./)
})
