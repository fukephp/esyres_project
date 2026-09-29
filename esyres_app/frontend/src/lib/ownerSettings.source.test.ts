// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('settings is a lazy owner route', () => {
  const app = read('App.tsx')
  expect(app).toMatch(/const OwnerSettings = lazy\(/)
  expect(app).toMatch(/path="\/owner\/settings"/)
  expect(app).toMatch(/OwnerPageSkeleton/)
})

test('settings sits in OwnerShell like the catalog', () => {
  const page = read('pages/OwnerSettings.tsx')
  expect(page).toMatch(/<TopNav/)
  expect(page).toMatch(/<OwnerShell/)
  expect(page).not.toMatch(/<OwnerNav/)
  expect(page).toMatch(/active="settings"/)
  expect(page).toMatch(/useOwnerPush\(ownerReady\)/)
  expect(page).toMatch(/inFlightIntakeCount/)
  expect(page).not.toMatch(/\?salon=/)
  expect(page).not.toMatch(/onSalon/)
  expect(page).not.toMatch(/t\('owner\.salon'\)/)
  expect(page).not.toMatch(/GUEST_COLUMN_CLASS/)
  expect(page).toMatch(/allowRegister=\{false\}/)
  expect(page).toMatch(/data\?\.me == null[\s\S]*auth\.placePanel[\s\S]*AuthShell/)
  expect(page).toMatch(/emailVerified[\s\S]*auth\.placePanel[\s\S]*EmailVerifyPanel/)
  expect(page).toMatch(/owner\.notOwner/)
  expect(page).toMatch(/CREATE_SALON_PATH/)
  expect(page).toMatch(/owner\.createSalon/)
  expect(page).toMatch(/owner\.title/)
})

test('Prikaz toggle saves CALENDAR or KANBAN on the account above the password card', () => {
  const page = read('pages/OwnerSettings.tsx')
  expect(page).toMatch(/UPDATE_OWNER_VIEW_MUTATION/)
  expect(page).toMatch(/role="radiogroup"/)
  expect(page).toMatch(/\['CALENDAR', 'KANBAN'\]/)
  expect(page).toMatch(/owner\.viewCalendar/)
  expect(page).toMatch(/owner\.viewKanban/)
  expect(page).toMatch(/aria-checked=\{on\}/)
  expect(page.indexOf("t('owner.view')")).toBeLessThan(page.indexOf("t('owner.passwordTitle')"))
  const auth = read('graphql/auth.ts')
  expect(auth).toMatch(/mutation UpdateOwnerView\(\$view: OwnerView!\)/)
  expect(auth).toMatch(/query Me \{[\s\S]*ownerView[\s\S]*salons \{/)
  expect(auth).toMatch(/ownerView: OwnerView/)
})

test('settings password form keeps three fields and mismatch returns before the mutation', () => {
  const page = read('pages/OwnerSettings.tsx')
  expect(page).toMatch(/owner\.settings/)
  expect(page).toMatch(/text-body[\s\S]*data\.me\.email/)
  expect(page).toMatch(/owner\.passwordCurrent/)
  expect(page).toMatch(/owner\.passwordNew/)
  expect(page).toMatch(/owner\.passwordConfirm/)
  expect(page).toMatch(/owner\.save/)
  expect(page).toMatch(/disabled=\{saving\}/)
  expect(page.match(/type="password"/g)?.length).toBe(3)
  expect(page).not.toMatch(/type="email"/)
  expect(page).not.toMatch(/type="text"/)
  expect(page).toMatch(/setCurrent\(''\)/)
  expect(page).toMatch(/setNext\(''\)/)
  expect(page).toMatch(/setConfirm\(''\)/)
  expect(page).toMatch(/owner\.passwordChanged/)
  expect(page).toMatch(/INVALID_CURRENT_PASSWORD/)
  expect(page).toMatch(/auth\.gate\.WEAK_PASSWORD/)
  const mismatchAt = page.indexOf('owner.passwordMismatch')
  const callAt = page.indexOf('changePassword(')
  expect(mismatchAt).toBeGreaterThan(-1)
  expect(callAt).toBeGreaterThan(mismatchAt)
  expect(page.slice(mismatchAt, callAt)).toMatch(/return/)
  const auth = read('graphql/auth.ts')
  expect(auth).toMatch(/mutation ChangePassword\(\$currentPassword: String!, \$password: String!\)/)
  expect(auth).not.toMatch(/\$confirm/)
})
