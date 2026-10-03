// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const edit = readFileSync(new URL('../pages/OwnerSalonEdit.tsx', import.meta.url), 'utf8')
const nav = readFileSync(new URL('../components/OwnerNav.tsx', import.meta.url), 'utf8')
const detail = readFileSync(new URL('../pages/OwnerRequestDetail.tsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8')

describe('owner ratings', () => {
  it('renders a read-only list after the gallery', () => {
    expect(edit.lastIndexOf('owner.gallery')).toBeLessThan(edit.indexOf('owner.ratings'))
    expect(edit).toMatch(/owner\.ratingsEmpty/)
    expect(edit).toMatch(/row\.authorName/)
    expect(edit).toMatch(/reply\.authorName/)
    expect(edit).not.toMatch(/salon\.rate|salon\.reply|deleteRating|ownerRatings\.hide/)
  })

  it('adds no reviews nav item and no ratings on request detail', () => {
    expect(nav).not.toMatch(/Recenzije|owner\.ratings/)
    expect(detail).not.toMatch(/owner\.ratings|Ocjene/)
    expect(app).not.toMatch(/\/owner\/reviews/)
  })
})
