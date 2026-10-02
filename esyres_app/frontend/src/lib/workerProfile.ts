import type { WorkerProfile } from '../graphql/auth'

export const WORKER_LIST_FIELDS = ['talents', 'specializations', 'certificates', 'education', 'brands'] as const
export type WorkerListField = (typeof WORKER_LIST_FIELDS)[number]

export const MAX_LIST_ROWS = 20
export const MAX_LIST_ROW_LENGTH = 80
export const MAX_STRONGEST = 5

export type WorkerDraft = {
  name: string
  about: string
  experienceYears: string
  portfolioUrl: string
  maintenance: string
  strongestServiceIds: string[]
} & Record<WorkerListField, string[]>

export function workerInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter((word) => word !== '')
  if (words.length === 0) {
    return ''
  }
  const first = words[0].charAt(0)
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : ''

  return (first + last).toUpperCase()
}

export function workerDraft(name: string, profile: WorkerProfile): WorkerDraft {
  return {
    name,
    about: profile.about ?? '',
    experienceYears: profile.experienceYears === null ? '' : String(profile.experienceYears),
    portfolioUrl: profile.portfolioUrl ?? '',
    maintenance: profile.maintenance ?? '',
    talents: [...profile.talents],
    specializations: [...profile.specializations],
    certificates: [...profile.certificates],
    education: [...profile.education],
    brands: [...profile.brands],
    strongestServiceIds: [...profile.strongestServiceIds],
  }
}

export function cleanListRows(rows: string[]): string[] {
  return rows.map((row) => row.trim()).filter((row) => row !== '')
}

export function workerInput(draft: WorkerDraft) {
  const years = draft.experienceYears.trim()

  return {
    name: draft.name.trim(),
    profile: {
      about: draft.about,
      experienceYears: years === '' ? null : Number.parseInt(years, 10),
      portfolioUrl: draft.portfolioUrl,
      maintenance: draft.maintenance,
      talents: cleanListRows(draft.talents),
      specializations: cleanListRows(draft.specializations),
      certificates: cleanListRows(draft.certificates),
      education: cleanListRows(draft.education),
      brands: cleanListRows(draft.brands),
      strongestServiceIds: draft.strongestServiceIds,
    },
  }
}
