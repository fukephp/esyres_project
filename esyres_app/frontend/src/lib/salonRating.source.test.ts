// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const block = readFileSync(new URL('../pages/SalonRating.tsx', import.meta.url), 'utf8')
const salon = readFileSync(new URL('../pages/SalonProfile.tsx', import.meta.url), 'utf8')
const profile = readFileSync(new URL('../pages/MyProfile.tsx', import.meta.url), 'utf8')
const bookings = readFileSync(new URL('../pages/MyBookings.tsx', import.meta.url), 'utf8')
const home = readFileSync(new URL('../pages/Homepage.tsx', import.meta.url), 'utf8')
const discovery = readFileSync(new URL('../pages/DiscoveryHome.tsx', import.meta.url), 'utf8')
const schema = readFileSync(new URL('../../../graphql/schema.graphql', import.meta.url), 'utf8')
const query = readFileSync(new URL('../graphql/salon.ts', import.meta.url), 'utf8')

describe('salon rating', () => {
  it('shows mean, then the form, then the rows, and omits an empty guest block', () => {
    const mean = block.indexOf('average')
    const form = block.indexOf('mayRate ?')
    const rows = block.indexOf('rows.map')
    expect(mean).toBeGreaterThan(-1)
    expect(form).toBeGreaterThan(mean)
    expect(rows).toBeGreaterThan(form)
    expect(block).toMatch(/count === 0 && !mayRate/)
    expect(block).toMatch(/#2F6FED/)
    expect(block).not.toMatch(/email/)
  })

  it('sits after services and leaves the aside empty', () => {
    expect(salon.lastIndexOf('salon.services')).toBeLessThan(salon.lastIndexOf('<SalonRatingBlock'))
    expect(salon).toMatch(/aria-hidden="true"/)
    expect(query).toMatch(/ratingAverage/)
    expect(query).not.toMatch(/ratings \{/)
  })

  it('lists my ratings and keeps stars off bookings, discovery, and the homepage', () => {
    expect(block).toMatch(/profile\.ratings/)
    expect(block).toMatch(/profile\.ratingsEmpty/)
    expect(block).toMatch(/row\.salon\.id/)
    expect(profile).toMatch(/MyRatingsList/)
    expect(bookings).not.toMatch(/ratingAverage|SalonRating|#2F6FED/)
    expect(home).not.toMatch(/ratingAverage|SalonRating|#2F6FED/)
    expect(discovery).not.toMatch(/ratingAverage|SalonRating|#2F6FED/)
    expect(schema).not.toMatch(/deleteRating/)
  })
})
