// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const page = readFileSync(new URL('../pages/CustomerSettings.tsx', import.meta.url), 'utf8')
const profile = readFileSync(new URL('../pages/MyProfile.tsx', import.meta.url), 'utf8')
const places = readFileSync(new URL('./savedPlace.ts', import.meta.url), 'utf8')
const discovery = readFileSync(new URL('../pages/DiscoveryHome.tsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8')

describe('customer settings', () => {
  it('keeps the guest on the customer auth shell via the profile page', () => {
    expect(profile).toMatch(/AuthShell place="customer"/)
  })

  it('opens as a right Aside over the profile from a gear button and closes to /my-profile', () => {
    expect(profile).toMatch(/useLocation\(\)\.pathname === SETTINGS_HREF/)
    expect(profile).toMatch(/<GearIcon \/>/)
    expect(profile).toMatch(/aria-label=\{t\('profile\.settings'\)\}/)
    expect(profile).toMatch(/<Aside open=\{settingsOpen\} onClose=\{\(\) => navigate\(PROFILE_HREF\)\}/)
    expect(profile).toMatch(/<CustomerSettingsForm/)
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
    expect(app).toMatch(/path="\/my-profile\/settings" element=\{customer\(<MyProfile \/>\)\}/)
  })

  it('skips the browser location when a saved place is set', () => {
    const body = discovery.slice(discovery.indexOf('function useGeo'))
    const placeReturn = body.indexOf('if (place)')
    const prompt = body.indexOf('getCurrentPosition')
    expect(placeReturn).toBeGreaterThan(-1)
    expect(placeReturn).toBeLessThan(prompt)
  })
})
