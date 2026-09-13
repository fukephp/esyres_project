// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { SALON_SEND_CLASS } from './salonSend'

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

test('press hex stays arbitrary; hairline and Inter stay tokens', () => {
  const css = read('index.css')
  expect(css).toMatch(/--color-hairline:\s*#e5e7eb/)
  expect(css).toMatch(/--font-sans:\s*Inter/)
  expect(css).not.toMatch(/--color-ink-press/)
  expect(read('lib/salonSend.ts')).not.toMatch(/from '\.\/homepage'/)
})

test('i18n send stays Pošalji zahtjev; sendHint is header-only copy', () => {
  const i18n = read('i18n.ts')
  expect(i18n).toMatch(/send: 'Pošalji zahtjev'/)
  expect(i18n).toMatch(/sendHint: 'Odaberi usluge, dan i vrijeme\.'/)
  expect(i18n).toMatch(/submit: 'Pošalji'/)
})

test('four Pošalji zahtjev use SALON_SEND_CLASS and salon.send', () => {
  const page = read('pages/SalonProfile.tsx')
  const chat = read('components/AssistantIntake.tsx')
  expect(page).toMatch(/from '\.\.\/lib\/salonSend'/)
  expect(chat).toMatch(/from '\.\.\/lib\/salonSend'/)

  expect(page).toMatch(/type="button"[\s\S]*className=\{`mt-8 \$\{SALON_SEND_CLASS\}`\}[\s\S]*salon\.send/)
  expect(page).toMatch(/type="submit"[\s\S]*className=\{SALON_SEND_CLASS\}[\s\S]*salon\.send/)
  expect(chat).toMatch(/type="submit"[\s\S]*className=\{SALON_SEND_CLASS\}[\s\S]*salon\.send/)

  expect(page).not.toMatch(/salon\.submit/)
  expect(chat).not.toMatch(/salon\.submit/)
  expect(page).not.toMatch(/gsap|GSAP|three\.js|Three\.js/)
  expect(chat).not.toMatch(/gsap|GSAP/)
})
