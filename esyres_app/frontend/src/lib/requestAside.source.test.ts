// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('Aside is a right-anchored modal dialog with fade + slide and reduced-motion fade', () => {
  const aside = read('components/Aside.tsx')
  expect(aside).toMatch(/<dialog/)
  expect(aside).toMatch(/showModal\(\)/)
  expect(aside).toMatch(/inset-y-0 right-0/)
  expect(aside).toMatch(/w-full/)
  expect(aside).toMatch(/md:w-\[440px\]/)
  expect(aside).toMatch(/bg-white/)
  expect(aside).toMatch(/duration-\[250ms\] ease-out/)
  expect(aside).toMatch(/translate-x-full/)
  expect(aside).toMatch(/motion-reduce:translate-x-0/)
  expect(aside).toMatch(/motion-reduce:transition-opacity/)
  expect(aside).toMatch(/onCancel=\{\(event\) => \{\s*event\.preventDefault\(\)\s*onClose\(\)/)
  expect(aside).toMatch(/aria-hidden[\s\S]*onClick=\{onClose\}/)
  expect(aside).toMatch(/<CloseButton onClick=\{onClose\} \/>/)
  expect(aside).toMatch(/overflow-y-auto/)
  expect(aside).toMatch(/overflow = 'hidden'/)
})

test('board cards open the aside in place; no request links remain', () => {
  const boards = read('components/OwnerBoards.tsx')
  const home = read('pages/OwnerHome.tsx')
  const zapisi = read('pages/OwnerZapisi.tsx')
  for (const text of [boards, home, zapisi]) {
    expect(text).not.toMatch(/\/owner\/requests\//)
  }
  expect(boards).not.toMatch(/<Link/)
  expect(home).toMatch(/<RequestDetailAside/)
  expect(home).toMatch(/onChanged=\{refetchAll\}/)
  expect(home).toMatch(/onPropose=\{\(\) => openAside\(row\.id\)\}/)
  expect(zapisi).toMatch(/<RequestDetailAside/)
  expect(home).not.toMatch(/lockedSearch/)
  expect(zapisi).not.toMatch(/lockedSearch/)
})

test('Request Detail renders inside Aside with name + clock header and no Nazad', () => {
  const detail = read('pages/OwnerRequestDetail.tsx')
  expect(detail).toMatch(/<Aside[\s\S]*title=\{booking !== undefined && !missing \? booking\.customerName/)
  expect(detail).toMatch(/headerExtra=\{clock === null/)
  expect(detail).not.toMatch(/owner\.back/)
  expect(detail).not.toMatch(/SALON_PICKER_DIALOG_CLASS/)
  expect(detail).toMatch(/loadingBooking \? \(\s*<RequestDetailSkeleton \/>/)
  expect(read('components/Aside.tsx')).not.toMatch(/rounded-3xl/)
})

test('pasted /owner/requests/:id replace-redirects to Zahtjevi with the aside opened once', () => {
  expect(read('App.tsx')).toMatch(/path="\/owner\/requests\/:id"/)
  const detail = read('pages/OwnerRequestDetail.tsx')
  const redirect = detail.slice(detail.indexOf('export function OwnerRequestDetail'), detail.indexOf('export function RequestDetailAside'))
  expect(redirect).toMatch(/<Navigate\s+replace\s+to=\{ownerQueuePath\(booking\.preferredDate/)
  expect(redirect).toMatch(/<Navigate replace to="\/owner" state=\{state\}/)
  expect(redirect).toMatch(/OPEN_REQUEST_STATE\]: id/)
  const home = read('pages/OwnerHome.tsx')
  expect(home).toMatch(/openRequestFromState\(location\.state\)/)
  expect(home).toMatch(/navigate\(`\$\{location\.pathname\}\$\{location\.search\}`, \{ replace: true, state: null \}\)/)
})

test('switcher hides while open; mutations keep the aside open and refresh the board', () => {
  const detail = read('pages/OwnerRequestDetail.tsx')
  for (const fn of ['onAccept', 'onAssign', 'onPropose', 'onDecline']) {
    const body = detail.slice(detail.indexOf(`async function ${fn}`))
    const end = body.indexOf('\n  }\n')
    expect(body.slice(0, end), fn).toMatch(/await changed\(\)/)
    expect(body.slice(0, end), fn).not.toMatch(/onClose/)
  }
  expect(read('pages/OwnerHome.tsx')).toMatch(/hideSwitcher=\{asideOpen\}/)
})
