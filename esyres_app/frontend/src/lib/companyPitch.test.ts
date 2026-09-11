import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import {
  STORAGE_KEY,
  companyPitchSeen,
  markCompanyPitchSeen,
  shouldShowCompanyPitch,
} from './companyPitch'

class MemoryStorage implements Storage {
  private data = new Map<string, string>()

  get length(): number {
    return this.data.size
  }

  clear(): void {
    this.data.clear()
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value))
  }
}

test('shouldShowCompanyPitch is only unseen home', () => {
  expect(shouldShowCompanyPitch('/', false)).toBe(true)
  expect(shouldShowCompanyPitch('', false)).toBe(true)
  expect(shouldShowCompanyPitch('/', true)).toBe(false)
  expect(shouldShowCompanyPitch('/salon/1', false)).toBe(false)
  expect(shouldShowCompanyPitch('/salon/1', true)).toBe(false)
  expect(shouldShowCompanyPitch('/bookings', false)).toBe(false)
  expect(shouldShowCompanyPitch('/owner', false)).toBe(false)
  expect(shouldShowCompanyPitch('/owner/stats', false)).toBe(false)
  expect(shouldShowCompanyPitch('/welcome', false)).toBe(false)
  expect(shouldShowCompanyPitch('/salons', false)).toBe(false)
})

test('companyPitchSeen reads localStorage key 1 only', () => {
  const storage = new MemoryStorage()
  expect(STORAGE_KEY).toBe('esyres.companyPitchSeen')
  expect(companyPitchSeen(storage)).toBe(false)
  storage.setItem(STORAGE_KEY, '')
  expect(companyPitchSeen(storage)).toBe(false)
  storage.setItem(STORAGE_KEY, 'true')
  expect(companyPitchSeen(storage)).toBe(false)
  storage.setItem(STORAGE_KEY, '1')
  expect(companyPitchSeen(storage)).toBe(true)
})

test('markCompanyPitchSeen writes 1', () => {
  const storage = new MemoryStorage()
  markCompanyPitchSeen(storage)
  expect(storage.getItem(STORAGE_KEY)).toBe('1')
  expect(companyPitchSeen(storage)).toBe(true)
})

test('pitch copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('pitch.brand')).toBe('Esyres')
  expect(i18n.t('pitch.h1')).toBe('Rezervacije bez jurnjave za terminom')
  expect(i18n.t('pitch.support')).toBe(
    'Odabereš dan i željeno vrijeme. Salon prihvati ili predloži drugo. Potvrdiš samo kad predlože drugačije vrijeme.',
  )
  expect(i18n.t('pitch.step1')).toBe('Odaberi dan i željeno vrijeme.')
  expect(i18n.t('pitch.step2')).toBe('Salon prihvati ili prilagodi.')
  expect(i18n.t('pitch.step3')).toBe('Potvrdiš samo ako predlože drugo vrijeme.')
  expect(i18n.t('pitch.cta')).toBe('Pronađi salon')
})

test('App / is HomeGate not DiscoveryHome', () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../App.tsx'), 'utf8')
  expect(src).toContain('path="/" element={<HomeGate />}')
  expect(src).not.toContain('path="/" element={<DiscoveryHome />}')
  expect(src).not.toMatch(/path="\/welcome"/)
  expect(src).not.toMatch(/path="\/salons"/)
})

test('HomeGate mounts pitch or discovery, never both', () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../pages/HomeGate.tsx'), 'utf8')
  expect(src).toContain('shouldShowCompanyPitch')
  expect(src).toMatch(/if \(shouldShowCompanyPitch\([^)]+\)\) \{\s*return \(\s*<CompanyPitch/)
  expect(src).toMatch(/return <DiscoveryHome \/>/)
  expect(src).not.toMatch(/<>[\s\S]*<CompanyPitch[\s\S]*<DiscoveryHome/)
})
