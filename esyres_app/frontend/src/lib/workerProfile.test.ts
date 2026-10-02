import { expect, test } from 'vitest'
import { cleanListRows, workerDraft, workerInitials, workerInput } from './workerProfile'

test('initials use first letter of first and last word', () => {
  expect(workerInitials('Joe Doe')).toBe('JD')
  expect(workerInitials('ana maria kovač')).toBe('AK')
  expect(workerInitials('Ana')).toBe('A')
  expect(workerInitials('  šejla  ')).toBe('Š')
  expect(workerInitials('   ')).toBe('')
})

test('list rows drop blanks and keep order', () => {
  expect(cleanListRows([' a ', '', '  ', 'b'])).toEqual(['a', 'b'])
})

test('draft round-trips into the update input', () => {
  const draft = workerDraft('Ana', {
    photoUrl: null,
    about: null,
    experienceYears: 7,
    portfolioUrl: null,
    maintenance: null,
    talents: ['šminka'],
    specializations: [],
    certificates: [],
    education: [],
    brands: [],
    strongestServiceIds: ['3'],
  })
  draft.talents.push('  ')
  expect(draft.experienceYears).toBe('7')
  expect(workerInput(draft)).toEqual({
    name: 'Ana',
    profile: {
      about: '',
      experienceYears: 7,
      portfolioUrl: '',
      maintenance: '',
      talents: ['šminka'],
      specializations: [],
      certificates: [],
      education: [],
      brands: [],
      strongestServiceIds: ['3'],
    },
  })
  draft.experienceYears = ''
  expect(workerInput(draft).profile.experienceYears).toBeNull()
})
