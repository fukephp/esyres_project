// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('homepage sections run hero, Kako radi, audiences, Popularno, FAQ, dark footer', () => {
  const page = read('pages/Homepage.tsx')
  const order = [
    "t('pitch.h1')",
    '<HeroMock />',
    "t('home.howTitle')",
    "t('home.guestsTitle')",
    "t('home.salonsTitle')",
    "t('home.popularTitle')",
    "t('home.faqTitle')",
    'bg-surface-dark text-on-dark',
  ]
  const at = order.map((needle) => page.indexOf(needle))
  expect(at.every((i) => i > -1)).toBe(true)
  expect([...at].sort((a, b) => a - b)).toEqual(at)
})

test('auth open hides every section below the nav', () => {
  const page = read('pages/Homepage.tsx')
  const authAt = page.indexOf('{authOpen ? (')
  const elseAt = page.indexOf(') : (', authAt)
  const authBranch = page.slice(authAt, elseAt)
  expect(authBranch).toMatch(/AuthShell/)
  expect(authBranch).not.toMatch(/home\.howTitle|HeroMock|home\.faqTitle|<footer/)
  expect(page).toMatch(/skip: authOpen !== null/)
})

test('hero mock is aria-hidden static copy; popular strip is capped and hidden when empty', () => {
  const page = read('pages/Homepage.tsx')
  const mock = page.slice(page.indexOf('function HeroMock'), page.indexOf('function AudienceCard'))
  expect(mock).toMatch(/aria-hidden="true"/)
  expect(mock).not.toMatch(/useQuery/)
  expect(mock).toMatch(/home\.mockRow1/)
  expect(page).toMatch(/POPULAR_IN_SARAJEVO_QUERY/)
  expect(page).toMatch(/\.slice\(0, 4\)/)
  expect(page).toMatch(/salons\.length > 0 \?/)
  expect(page).toMatch(/to=\{`\/salon\/\$\{salon\.id\}`\}/)
  expect(page).toMatch(/home\.showAll/)
  expect(page.match(/<details/g)?.length).toBe(1)
  expect(page).toMatch(/home\.faq1Q[\s\S]*home\.faq2Q[\s\S]*home\.faq3Q/)
  expect(page).toMatch(/homepageChrome\(data\?\.me \?\? null\)\.panel\.href/)
  expect(page).not.toMatch(/gsap|three/i)
})

test('homepage section copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('home.howTitle')).toBe('Kako radi')
  expect(i18n.t('home.guestsTitle')).toBe('Za goste')
  expect(i18n.t('home.salonsTitle')).toBe('Za salone')
  expect(i18n.t('home.salonsCta')).toBe('Otvori panel')
  expect(i18n.t('home.popularTitle')).toBe('Popularno u Sarajevu')
  expect(i18n.t('home.showAll')).toBe('Prikaži sve')
  expect(i18n.t('home.faqTitle')).toBe('Česta pitanja')
})
