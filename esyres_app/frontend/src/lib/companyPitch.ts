export const STORAGE_KEY = 'esyres.companyPitchSeen'

export function companyPitchSeen(storage: Storage): boolean {
  return storage.getItem(STORAGE_KEY) === '1'
}

export function markCompanyPitchSeen(storage: Storage): void {
  storage.setItem(STORAGE_KEY, '1')
}

export function shouldShowCompanyPitch(path: string, seen: boolean): boolean {
  if (seen) {
    return false
  }
  return path === '/' || path === ''
}
