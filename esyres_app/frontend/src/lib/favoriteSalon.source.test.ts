// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const salon = readFileSync(new URL('../pages/SalonProfile.tsx', import.meta.url), 'utf8')
const profile = readFileSync(new URL('../pages/MyProfile.tsx', import.meta.url), 'utf8')
const user = readFileSync(new URL('../../../app/Models/User.php', import.meta.url), 'utf8')

describe('favorite salon', () => {
  it('shows save only for a logged-in customer', () => {
    expect(salon).toMatch(/meData\?\.me != null/)
    expect(salon).toMatch(/salon\.save/)
    expect(salon).toMatch(/salon\.saved/)
  })

  it('lists favorites by the server order, links the name, and unsaves', () => {
    expect(profile).toMatch(/profile\.favorites/)
    expect(profile).toMatch(/profile\.favoritesEmpty/)
    expect(profile).toMatch(/\/salon\/\$\{salon\.id\}/)
    expect(profile).toMatch(/salon\.saved/)
    expect(profile).toMatch(/favoriteSalons\.map/)
    expect(user).toMatch(/orderBy\('salons\.name'\)/)
  })
})
