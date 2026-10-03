// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const block = readFileSync(new URL('../pages/SalonRating.tsx', import.meta.url), 'utf8')
const bookings = readFileSync(new URL('../pages/MyBookings.tsx', import.meta.url), 'utf8')

describe('rating replies', () => {
  it('shows the replier name and the text', () => {
    expect(block).toMatch(/reply\.authorName/)
    expect(block).toMatch(/reply\.body/)
    expect(block).not.toMatch(/reply\.email/)
  })

  it('does not put a reply box on my bookings', () => {
    expect(bookings).not.toMatch(/replyToRating|salon\.reply/)
  })
})
