// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { ownerBounce } from './owner'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

const OWNER_PATHS = [
  '/owner',
  '/owner/chats',
  '/owner/stats',
  '/owner/requests/:id',
  '/owner/salons',
  '/owner/salons/create',
  '/owner/salons/:id',
  '/owner/settings',
  '/owner/zapisi',
  '/owner/phone',
]

test('ownerBounce goes back only when the tab has an earlier in-app page', () => {
  expect(ownerBounce(1)).toBe('back')
  expect(ownerBounce(5)).toBe('back')
  expect(ownerBounce(0)).toBe('home')
  expect(ownerBounce(undefined)).toBe('home')
  expect(ownerBounce(null)).toBe('home')
  expect(ownerBounce('2')).toBe('home')
})

test('every owner route goes through owner(), which wraps Suspense in OwnerGate', () => {
  const app = read('App.tsx')
  for (const path of OWNER_PATHS) {
    const line = app.split('\n').find((row) => row.includes(`path="${path}"`))
    expect(line, path).toMatch(/element=\{owner\(/)
  }
  expect(app).toMatch(/function owner\([\s\S]*<OwnerGate>\s*<Suspense[\s\S]*<\/Suspense>\s*<\/OwnerGate>/)
})

test('OwnerGate shows plain background until me is known, bounces non-owners silently', () => {
  const gate = read('components/OwnerGate.tsx')
  expect(gate).toMatch(/useQuery<MeData>\(ME_QUERY\)/)
  expect(gate).toMatch(/loading && data === undefined/)
  expect(gate).toMatch(/me != null && !isOwnerMe\(me\)/)
  expect(gate).not.toMatch(/emailVerified/)
  expect(gate).toMatch(/window\.history\.state/)
  expect(gate).toMatch(/ownerBounce\(idx\) === 'back'[\s\S]*navigate\(-1\)[\s\S]*navigate\('\/', \{ replace: true \}\)/)
  expect(gate).toMatch(/<div className="min-h-svh bg-page" \/>/)
  expect(gate).not.toMatch(/OwnerShell|Skeleton|useTranslation|toast/)
})

test('no owner page or copy keeps the not-owner block', () => {
  const pages = readdirSync(join(src, 'pages')).filter((f) => f.startsWith('Owner') && f.endsWith('.tsx'))
  expect(pages.length).toBeGreaterThan(5)
  for (const file of pages) {
    expect(read(`pages/${file}`), file).not.toMatch(/notOwner/)
  }
  expect(read('i18n.ts')).not.toMatch(/notOwner/)
})
