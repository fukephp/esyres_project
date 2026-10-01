// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

function fn(text: string, name: string): string {
  const start = text.indexOf(`export function ${name}`)
  const next = text.indexOf('\nexport function ', start + 1)
  return text.slice(start, next === -1 ? undefined : next)
}

const skeleton = read('components/Skeleton.tsx')

test('Skeleton is a delayed status wrapper with sr-only loading copy', () => {
  expect(skeleton).toMatch(/export const SKELETON_DELAY_MS = 150/)
  expect(skeleton).toMatch(/setTimeout\(\(\) => setVisible\(true\), SKELETON_DELAY_MS\)/)
  expect(skeleton).toMatch(/clearTimeout/)
  const wrapper = fn(skeleton, 'Skeleton(')
  expect(wrapper).toMatch(/role="status"/)
  expect(wrapper).toMatch(/aria-busy="true"/)
  expect(wrapper).toMatch(/className="sr-only">\{t\('salon\.loading'\)\}/)
  expect(wrapper).toMatch(/visible \?/)
})

test('SkeletonBlock uses Design 2 fills, motion-safe pulse, no shadow or pastel', () => {
  const block = fn(skeleton, 'SkeletonBlock')
  expect(block).toMatch(/motion-safe:animate-pulse/)
  expect(block).toMatch(/bg-surface-dark-elevated/)
  expect(block).toMatch(/bg-surface-card/)
  expect(skeleton).not.toMatch(/shadow/)
  expect(skeleton).not.toMatch(/pastel/)
  expect(skeleton).not.toMatch(/spinner|animate-spin|shimmer/)
})

test('no page or list keeps a bare Učitavanje paragraph', () => {
  const files = [
    'App.tsx',
    'pages/DiscoveryHome.tsx',
    'pages/SalonProfile.tsx',
    'pages/MyBookings.tsx',
    'pages/CreateSalon.tsx',
    'pages/Homepage.tsx',
    'pages/OwnerHome.tsx',
    'pages/OwnerZapisi.tsx',
    'pages/OwnerChats.tsx',
    'pages/OwnerStats.tsx',
    'pages/OwnerSalons.tsx',
    'pages/OwnerSalonCreate.tsx',
    'pages/OwnerSalonEdit.tsx',
    'pages/OwnerSettings.tsx',
    'pages/OwnerRequestDetail.tsx',
    'pages/OwnerPhoneBooking.tsx',
  ]
  for (const file of files) {
    expect(read(file), file).not.toMatch(/salon\.loading/)
  }
})

test('guest page loading keeps TopNav with a page-shaped preset', () => {
  const cases = [
    ['pages/SalonProfile.tsx', 'SalonProfileSkeleton'],
    ['pages/CreateSalon.tsx', 'FormSkeleton'],
    ['pages/MyBookings.tsx', 'CardsSkeleton'],
  ] as const
  for (const [file, preset] of cases) {
    const text = read(file)
    const at = text.indexOf('<GuestPageSkeleton>')
    expect(at, file).toBeGreaterThan(-1)
    expect(text.slice(at - 80, at), file).toMatch(/<TopNav/)
    expect(text.slice(at, at + 120), file).toMatch(new RegExp(`<${preset}`))
  }
  expect(fn(skeleton, 'GuestPageSkeleton')).toMatch(/GUEST_COLUMN_CLASS/)
  expect(read('pages/DiscoveryHome.tsx')).toMatch(/<RowsSkeleton/)
  const profile = fn(skeleton, 'SalonProfileSkeleton')
  expect(profile).toMatch(/times\(7\)/)
})

test('owner loading renders a ghost OwnerShell with no interactive elements', () => {
  const ghost = fn(skeleton, 'OwnerShellGhost')
  expect(ghost).toMatch(/bg-surface-dark/)
  expect(ghost).toMatch(/md:w-16/)
  expect(ghost).not.toMatch(/md:w-60/)
  expect(ghost).toMatch(/h-6 w-6 rounded-full/)
  expect(ghost).toMatch(/fixed inset-x-0 bottom-0/)
  expect(ghost).toMatch(/SkeletonBlock dark/)
  expect(ghost).not.toMatch(/<Link|<a |<button|<select/)
  const app = read('App.tsx')
  expect(app).toMatch(/<Suspense fallback=\{<OwnerPageSkeleton>\{preset\}<\/OwnerPageSkeleton>\}>/)
  const owners = [
    ['pages/OwnerHome.tsx', 'OwnerWeekSkeleton'],
    ['pages/OwnerChats.tsx', 'RowsSkeleton'],
    ['pages/OwnerStats.tsx', 'TilesSkeleton'],
    ['pages/OwnerRequestDetail.tsx', 'RequestDetailSkeleton'],
    ['pages/OwnerSalons.tsx', 'OwnerSalonsSkeleton'],
    ['pages/OwnerSalonCreate.tsx', 'FormSkeleton'],
    ['pages/OwnerSalonEdit.tsx', 'OwnerSalonEditSkeleton'],
    ['pages/OwnerSettings.tsx', 'FormSkeleton'],
    ['pages/OwnerZapisi.tsx', 'RowsSkeleton'],
  ] as const
  for (const [file, preset] of owners) {
    const text = read(file)
    const loading = text.slice(text.indexOf('if (loading) {'), text.indexOf('if (data?.me == null)'))
    expect(loading, file).toMatch(/<OwnerPageSkeleton>/)
    expect(loading, file).toMatch(new RegExp(`<${preset}`))
    expect(loading, file).not.toMatch(/<TopNav/)
    expect(text, file).toMatch(/<TopNav/)
  }
})

test('owner presets match their surfaces', () => {
  expect(fn(skeleton, 'OwnerWeekSkeleton')).toMatch(/WeekGridBlocks/)
  expect(skeleton).toMatch(/grid-cols-7/)
  expect(fn(skeleton, 'KanbanSkeleton')).toMatch(/md:grid-cols-4/)
  expect(fn(skeleton, 'KanbanSkeleton')).toMatch(/times\(4\)/)
  expect(fn(skeleton, 'OwnerSalonsSkeleton')).toMatch(/times\(2\)/)
  expect(fn(skeleton, 'OwnerSalonsSkeleton')).toMatch(/border border-hairline/)
  expect(fn(skeleton, 'OwnerSalonEditSkeleton')).toMatch(/times\(4\)/)
  const detail = fn(skeleton, 'RequestDetailSkeleton')
  expect(detail).not.toMatch(/bg-canvas|rounded-3xl/)
  const home = read('pages/OwnerHome.tsx')
  expect(home).toMatch(/occupyingRange === undefined \? \(\s*<WeekGridSkeleton/)
  expect(home).toMatch(/queueLoading \? <ColumnSkeleton \/> : pendingList/)
  expect(home).toMatch(/dayBookings === undefined \? \(\s*<ColumnSkeleton/)
  expect(home).toMatch(/queueLoading \? \(\s*<ColumnSkeleton count=\{3\} \/>/)
  const zapisi = read('pages/OwnerZapisi.tsx')
  expect(zapisi).toMatch(/<KanbanSkeleton/)
  expect(zapisi).toMatch(/<RowsSkeleton count=\{4\}/)
  expect(read('pages/OwnerChats.tsx')).toMatch(/<RowsSkeleton count=\{4\} className/)
  expect(read('pages/OwnerStats.tsx')).toMatch(/<TilesSkeleton className/)
  expect(read('pages/OwnerPhoneBooking.tsx')).toMatch(/<PillsSkeleton \/>/)
})
