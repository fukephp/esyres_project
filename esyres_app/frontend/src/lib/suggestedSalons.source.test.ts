// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const profile = readFileSync(new URL('../pages/MyProfile.tsx', import.meta.url), 'utf8')
const home = readFileSync(new URL('../pages/Homepage.tsx', import.meta.url), 'utf8')
const discovery = readFileSync(new URL('../pages/DiscoveryHome.tsx', import.meta.url), 'utf8')

describe('suggested salons', () => {
  it('renders the discovery row only when the list is non-empty', () => {
    expect(profile).toMatch(/profile\.suggestions/)
    expect(profile).toMatch(/suggestions\.length > 0/)
    expect(profile).toMatch(/salon\.name/)
    expect(profile).toMatch(/salon\.busy/)
    expect(profile).toMatch(/discoverySalonCategoryNames/)
    expect(profile).toMatch(/discoveryAddressLine/)
    expect(profile).toMatch(/\/salon\/\$\{salon\.id\}/)
  })

  it('does not render the heading on the homepage or discovery', () => {
    expect(home).not.toMatch(/profile\.suggestions|Predloženi saloni/)
    expect(discovery).not.toMatch(/profile\.suggestions|Predloženi saloni/)
  })
})
