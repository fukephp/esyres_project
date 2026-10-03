// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const page = readFileSync(new URL('../pages/CustomerSettings.tsx', import.meta.url), 'utf8')
const places = readFileSync(new URL('./savedPlace.ts', import.meta.url), 'utf8')
const discovery = readFileSync(new URL('../pages/DiscoveryHome.tsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8')

describe('customer settings', () => {
  it('keeps the guest on the customer auth shell', () => {
    expect(page).toMatch(/AuthShell place="customer"/)
  })

  it('has a required name, an empty first place, one save, and the six municipalities', () => {
    expect(page).toMatch(/required/)
    expect(page).toMatch(/<option value="">/)
    expect(page).toMatch(/profile\.save/)
    expect(page).toMatch(/SAVED_PLACES/)
    expect(page.match(/type="submit"/g)).toHaveLength(1)
    for (const name of ['Centar', 'Stari Grad', 'Novo Sarajevo', 'Novi Grad', 'Ilidža', 'Vogošća']) {
      expect(places).toContain(name)
    }
  })

  it('is the customer settings route', () => {
    expect(app).toMatch(/path="\/my-profile\/settings" element=\{customer\(<CustomerSettings/)
  })

  it('skips the browser location when a saved place is set', () => {
    const body = discovery.slice(discovery.indexOf('function useGeo'))
    const placeReturn = body.indexOf('if (place)')
    const prompt = body.indexOf('getCurrentPosition')
    expect(placeReturn).toBeGreaterThan(-1)
    expect(placeReturn).toBeLessThan(prompt)
  })
})
