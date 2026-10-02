// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('Radnici is an exclusive accordion that lands collapsed and resets on chip switch', () => {
  const page = read('pages/OwnerSalonEdit.tsx')
  expect(page).toMatch(/useState<string \| null>\(null\)[\s\S]*openWorkerId/)
  expect(page).toMatch(/if \(next !== 'workers'\) \{\s*setOpenWorkerId\(null\)/)
  expect(page).toMatch(/open=\{openWorkerId === row\.id\}/)
  expect(page).toMatch(/current === row\.id \? null : row\.id/)
  expect(page).not.toMatch(/UPDATE_SALON_WORKER_MUTATION/)
})

test('row shows avatar + name and unmounts the form when collapsed', () => {
  const row = read('components/WorkerProfileRow.tsx')
  expect(row).toMatch(/<WorkerAvatar name=\{worker\.name\}[\s\S]*\{worker\.name\}/)
  expect(row).toMatch(/\{open \? <WorkerProfileForm/)
  expect(row).toMatch(/bg-pastel-pink/)
  expect(row).toMatch(/workerInitials\(name\)/)
})

test('expanded row keeps the story field order', () => {
  const row = read('components/WorkerProfileRow.tsx')
  const form = row.slice(row.indexOf('function WorkerProfileForm'))
  const order = [
    "t('owner.worker.photo')",
    "t('owner.workerName')",
    "t('owner.worker.about')",
    "t('owner.worker.experienceYears')",
    "t('owner.worker.portfolioUrl')",
    "listField('talents')",
    "listField('specializations')",
    "t('owner.worker.strongest')",
    "listField('certificates')",
    "listField('education')",
    "listField('brands')",
    "t('owner.worker.maintenance')",
    "t('owner.save')",
  ]
  const at = order.map((needle) => form.indexOf(needle, form.indexOf('return (\n    <form')))
  expect(at.every((i) => i > -1)).toBe(true)
  expect([...at].sort((a, b) => a - b)).toEqual(at)
})

test('photo uploads immediately; strongest capped at five; empty services copy; saved copy', () => {
  const row = read('components/WorkerProfileRow.tsx')
  expect(row).toMatch(/graphqlUpload\(UPLOAD_WORKER_PHOTO_MUTATION/)
  expect(row).toMatch(/REMOVE_WORKER_PHOTO_MUTATION/)
  expect(row).toMatch(/image\/jpeg,image\/png,image\/webp/)
  expect(row).toMatch(/draft\.strongestServiceIds\.length >= MAX_STRONGEST/)
  expect(row).toMatch(/owner\.worker\.noServices/)
  expect(row).toMatch(/owner\.worker\.saved/)
  expect(row).toMatch(/rows\.length < MAX_LIST_ROWS/)
  const i18n = read('i18n.ts')
  expect(i18n).toMatch(/noServices: 'Salon još nema usluga\.'/)
  expect(i18n).toMatch(/saved: 'Spremljeno\.'/)
  expect(i18n).toMatch(/talentsHint: 'npr\. šminka, manikir, depilacija'/)
  expect(i18n).toMatch(/maintenanceHint: 'npr\. osvježenje boje svakih 6 sedmica'/)
})

test('guest salon page and public salon query stay without worker profile', () => {
  expect(read('pages/SalonProfile.tsx')).not.toMatch(/profile \{|WorkerAvatar|photoUrl/)
  expect(read('graphql/salon.ts')).not.toMatch(/WorkerProfile|photoUrl/)
})
