// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import {
  SALON_BOOKING_ASIDE_CLASS,
  SALON_BOOKING_MAIN_CLASS,
  SALON_BOOKING_SPLIT_CLASS,
  SALON_SEND_CLASS,
} from './salonSend'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('SALON_SEND_CLASS is the salon Pošalji zahtjev pill', () => {
  expect(SALON_SEND_CLASS).toBe(
    'inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-canvas active:scale-[0.98] active:bg-[#242424] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:scale-100 disabled:bg-hairline disabled:text-muted',
  )
  expect(SALON_SEND_CLASS).not.toMatch(/py-3|font-medium|opacity-40|transition|animate-|pulse/)
})

test('booking split/aside/main classes are compact sticky sidebar chrome', () => {
  expect(SALON_BOOKING_SPLIT_CLASS).toBe('mt-8 md:flex md:gap-8 md:items-start')
  expect(SALON_BOOKING_ASIDE_CLASS).toBe(
    'w-full md:order-2 md:w-64 md:shrink-0 md:sticky md:top-8 md:self-start',
  )
  expect(SALON_BOOKING_MAIN_CLASS).toBe('min-w-0 flex-1 md:order-1')
  expect(SALON_BOOKING_SPLIT_CLASS).not.toMatch(/max-w-md/)
  expect(SALON_BOOKING_ASIDE_CLASS).not.toMatch(/max-w-md/)
  expect(SALON_BOOKING_MAIN_CLASS).not.toMatch(/max-w-md/)
  expect(SALON_BOOKING_ASIDE_CLASS.split(/\s+/)).toContain('md:sticky')
  expect(SALON_BOOKING_ASIDE_CLASS.split(/\s+/)).not.toContain('sticky')
})

test('press hex stays arbitrary; hairline and Inter stay tokens', () => {
  const css = read('index.css')
  expect(css).toMatch(/--color-hairline:\s*#e5e7eb/)
  expect(css).toMatch(/--font-sans:\s*Inter/)
  expect(css).not.toMatch(/--color-ink-press/)
  expect(read('lib/salonSend.ts')).not.toMatch(/from '\.\/homepage'/)
})

test('i18n send stays Pošalji zahtjev; sendHint is idle-only copy', () => {
  const i18n = read('i18n.ts')
  expect(i18n).toMatch(/send: 'Pošalji zahtjev'/)
  expect(i18n).toMatch(/sendHint: 'Odaberi usluge, dan i vrijeme\.'/)
  expect(i18n).toMatch(/ask: 'Nisi sigurna\? Pitaj salon\.'/)
  expect(i18n).toMatch(/submit: 'Pošalji'/)
})

test('three Pošalji zahtjev use SALON_SEND_CLASS and salon.send', () => {
  const page = read('pages/SalonProfile.tsx')
  const chat = read('components/AssistantIntake.tsx')
  expect(page).toMatch(/from '\.\.\/lib\/salonSend'/)
  expect(chat).toMatch(/from '\.\.\/lib\/salonSend'/)

  expect(page.match(/className=\{SALON_SEND_CLASS\}/g)?.length).toBe(2)
  expect(chat.match(/className=\{SALON_SEND_CLASS\}/g)?.length).toBe(1)
  expect(page).toMatch(/type="button"[\s\S]*className=\{SALON_SEND_CLASS\}[\s\S]*salon\.send/)
  expect(page).toMatch(/type="submit"[\s\S]*className=\{SALON_SEND_CLASS\}[\s\S]*salon\.send/)
  expect(chat).toMatch(/type="submit"[\s\S]*className=\{SALON_SEND_CLASS\}[\s\S]*salon\.send/)

  expect(page).not.toMatch(/salon\.submit/)
  expect(chat).not.toMatch(/salon\.submit/)
  expect(page).not.toMatch(/gsap|GSAP|three\.js|Three\.js/)
  expect(chat).not.toMatch(/gsap|GSAP/)
})

test('TopNav is not sticky', () => {
  expect(read('components/TopNav.tsx')).not.toMatch(/\bsticky\b/)
})
