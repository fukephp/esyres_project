// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('AuthShell register puts Ime i prezime first and maps INVALID_NAME', () => {
  const shell = read('components/AuthShell.tsx')
  expect(shell).toMatch(/pane === 'register'[\s\S]*auth\.name[\s\S]*auth\.email[\s\S]*auth\.password[\s\S]*auth\.phone/)
  expect(shell).toMatch(/name: name\.trim\(\)/)
  expect(shell).toMatch(/code === 'INVALID_NAME'/)
  expect(shell).toMatch(/auth\.gate\.INVALID_NAME/)
  expect(shell).toMatch(/auth\.login/)
  expect(shell).toMatch(/auth\.register/)
  expect(shell).toMatch(/variant === 'modal'[\s\S]*return box[\s\S]*PLACE_HEADING_CLASS[\s\S]*auth\.placePanel' : 'auth\.placeCustomer'/)
})

test('REGISTER_MUTATION sends name; LOGIN_MUTATION does not', () => {
  const auth = read('graphql/auth.ts')
  expect(auth).toMatch(/mutation Register\(\$name: String!/)
  expect(auth).toMatch(/register\(name: \$name, email: \$email, password: \$password, phone: \$phone\)/)
  expect(auth).toMatch(/mutation Login\(\$email: String!, \$password: String!\)/)
  expect(auth).not.toMatch(/mutation Login\([^)]*\$name/)
})

test('customer place heading is Rezervacije on homepage, bookings, and assistant', () => {
  const home = read('pages/Homepage.tsx')
  expect(home).toMatch(/<AuthShell key=\{authOpen\} place="customer"/)
  expect(home).not.toMatch(/auth\.placeCustomer/)

  const bookings = read('pages/MyBookings.tsx')
  expect(bookings).toMatch(/data\?\.me == null[\s\S]*<AuthShell place="customer"/)
  expect(bookings).toMatch(/bookings\.title/)
  expect(bookings).toMatch(/EmailVerifyPanel/)

  const salon = read('pages/SalonProfile.tsx')
  expect(salon).toMatch(/meData\?\.me == null[\s\S]*salon\.loginToRequest[\s\S]*AuthShell/)
  expect(salon).toMatch(/<AuthShell variant="modal" onAuthenticated=\{\(\) => setNeedLogin\(false\)\}/)
  expect(salon).not.toMatch(/auth\.placeCustomer/)

  const assistant = read('components/AssistantIntake.tsx')
  expect(assistant).toMatch(/<p className=\{PLACE_HEADING_CLASS\}>\{t\('auth\.placeCustomer'\)\}<\/p>/)
  expect(assistant).toMatch(/chrome === 'login'[\s\S]*auth\.placeCustomer[\s\S]*<AuthShell variant="modal"/)
  expect(assistant).not.toMatch(/chrome === 'login'[\s\S]*<h1[\s\S]*auth\.placeCustomer/)
})

test('panel place heading on create-salon auth/verify; Ime salona form has none', () => {
  const page = read('pages/CreateSalon.tsx')
  expect(page).toMatch(/surface === 'auth'[\s\S]*<AuthShell place="panel"/)
  expect(page).toMatch(/surface === 'verify'[\s\S]*auth\.placePanel[\s\S]*EmailVerifyPanel/)
  expect(page).toMatch(/createSalon\.name/)
  expect(page).toMatch(/createSalon\.INVALID_NAME/)
  expect(page).not.toMatch(/<form[\s\S]*auth\.placePanel/)
})

test('owner logged-out and email-verify use Panel; session titles return; Registracija everywhere', () => {
  const files = [
    'pages/OwnerHome.tsx',
    'pages/OwnerChats.tsx',
    'pages/OwnerStats.tsx',
    'pages/OwnerRequestDetail.tsx',
    'pages/OwnerSalons.tsx',
    'pages/OwnerSalonCreate.tsx',
    'pages/OwnerSalonEdit.tsx',
    'pages/OwnerSettings.tsx',
    'pages/OwnerZapisi.tsx',
  ]
  for (const file of files) {
    const text = read(file)
    expect(text, file).not.toMatch(/allowRegister/)
    expect(text, file).toMatch(/data\?\.me == null[\s\S]*<AuthShell place="panel"/)
    expect(text, file).toMatch(/emailVerified[\s\S]*auth\.placePanel[\s\S]*EmailVerifyPanel/)
    expect(text, file).not.toMatch(/data\?\.me == null[\s\S]*owner\.(title|chat|stats|salons)[\s\S]*AuthShell/)
  }
  expect(read('pages/OwnerHome.tsx')).toMatch(/owner\.title/)
  expect(read('pages/OwnerChats.tsx')).toMatch(/owner\.chat/)
  expect(read('pages/OwnerStats.tsx')).toMatch(/owner\.stats/)
  expect(read('pages/OwnerRequestDetail.tsx')).toMatch(/owner\.title/)
  expect(read('pages/OwnerSalons.tsx')).toMatch(/owner\.salons/)
  expect(read('pages/OwnerSalonCreate.tsx')).toMatch(/owner\.addSalon/)
  expect(read('pages/OwnerSalonEdit.tsx')).toMatch(/owner\.salonName/)
  expect(read('pages/OwnerSettings.tsx')).toMatch(/owner\.settings/)
})
