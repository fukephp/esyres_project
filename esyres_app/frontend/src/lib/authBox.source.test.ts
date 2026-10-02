// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { topNavChrome } from './homepage'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

const shell = read('components/AuthShell.tsx')

const AUTH_SURFACES = [
  'pages/Homepage.tsx',
  'pages/MyBookings.tsx',
  'pages/CreateSalon.tsx',
  'pages/SalonProfile.tsx',
  'pages/ResetPassword.tsx',
  'components/AssistantIntake.tsx',
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

test('allowRegister is gone; every surface uses AuthShell with a page place or the modal variant', () => {
  expect(shell).not.toMatch(/allowRegister/)
  for (const file of AUTH_SURFACES) {
    const text = read(file)
    expect(text, file).not.toMatch(/allowRegister/)
    expect(text, file).toMatch(/<AuthShell[^>]*(place="(customer|panel)"|variant="modal")/)
  }
  expect(read('pages/SalonProfile.tsx')).toMatch(/<AuthShell variant="modal"/)
  expect(read('components/AssistantIntake.tsx')).toMatch(/<AuthShell variant="modal"/)
})

test('page variant is one centered card with the place heading inside; modal has no card', () => {
  expect(shell).toMatch(/variant === 'modal'\) \{\s*return box\s*\}/)
  expect(shell).toMatch(/<main className="flex flex-1 items-center justify-center/)
  expect(shell).toMatch(/max-w-\[400px\] rounded-3xl border border-hairline bg-canvas/)
  expect(shell).toMatch(/PLACE_HEADING_CLASS\} text-center/)
  for (const file of AUTH_SURFACES.filter((f) => f.startsWith('pages/Owner') || f === 'pages/CreateSalon.tsx')) {
    expect(read(file), file).not.toMatch(/PLACE_HEADING_CLASS\}>\{t\('auth\.placePanel'\)\}<\/h1>\s*<div className="mt-8">\s*<AuthShell/)
  }
})

test('chips: inactive plain text, one sliding black pill; panel slides with fade; height animates; reduced motion instant', () => {
  expect(shell).toMatch(/absolute inset-y-0 left-0 w-1\/2 rounded-full bg-ink transition-transform duration-200/)
  expect(shell).toMatch(/pane === 'register' \? 'translate-x-full' : 'translate-x-0'/)
  expect(shell).toMatch(/'font-semibold text-canvas' : 'text-body'/)
  expect(shell).toMatch(/auth-pane-forward/)
  expect(shell).toMatch(/auth-pane-back/)
  expect(shell).toMatch(/new ResizeObserver/)
  expect(shell).toMatch(/transition-\[height\] duration-200/)
  expect(shell.match(/motion-reduce:transition-none/g)?.length ?? 0).toBeGreaterThanOrEqual(3)
  const css = read('index.css')
  expect(css).toMatch(/@keyframes auth-pane-from-right[\s\S]*opacity: 0[\s\S]*translateX\(24px\)/)
  expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*\.auth-pane-forward,\s*\.auth-pane-back \{\s*animation: none/)
  const pkg = read('../package.json')
  expect(pkg).not.toMatch(/framer-motion|motion"|react-spring/)
})

test('password eye toggle; no subtitle, Google, or Or divider', () => {
  expect(shell).toMatch(/type=\{visible \? 'text' : 'password'\}/)
  expect(shell).toMatch(/visible \? t\('auth\.hidePassword'\) : t\('auth\.showPassword'\)/)
  expect(shell).not.toMatch(/google/i)
  expect(shell).not.toMatch(/subtitle/i)
  expect(shell).not.toMatch(/auth\.or\b/)
  const i18n = read('i18n.ts')
  expect(i18n).toMatch(/showPassword: 'Prikaži lozinku'/)
  expect(i18n).toMatch(/hidePassword: 'Sakrij lozinku'/)
  expect(shell).toMatch(/className="field/)
  expect(shell).toMatch(/w-full items-center justify-center gap-2 rounded-full bg-ink/)
})

test('forgot pane: link under Lozinka on Prijava, not a chip; Nazad na prijavu; same answer always', () => {
  expect(shell).toMatch(/auth\.password[\s\S]*pane === 'login' \?[\s\S]*go\('forgot'\)[\s\S]*auth\.forgot/)
  expect(shell).toMatch(/const tabs = pane === 'login' \|\| pane === 'register'/)
  expect(shell).toMatch(/pane === 'forgot'[\s\S]*requestReset\(\{ variables: \{ email: email\.trim\(\) \} \}\)[\s\S]*setNotice\(t\('auth\.forgotSent'\)\)/)
  expect(shell).toMatch(/go\('login'\)\}>\s*\{t\('auth\.backToLogin'\)\}/)
  const i18n = read('i18n.ts')
  expect(i18n).toMatch(/forgot: 'Zaboravljena lozinka\?'/)
  expect(i18n).toMatch(/backToLogin: 'Nazad na prijavu'/)
  expect(i18n).toMatch(/forgotSent: 'Ako račun postoji, poslali smo link\.'/)
  const auth = read('graphql/auth.ts')
  expect(auth).toMatch(/requestPasswordReset\(email: \$email\)/)
  expect(auth).toMatch(/resetPassword\(email: \$email, token: \$token, password: \$password\)/)
})

test('/reset-password: Rezervacije card, Nova lozinka, success on Prijava with email, invalid link back to forgot', () => {
  const app = read('App.tsx')
  expect(app).toMatch(/<Route path=\{RESET_PASSWORD_PATH\} element=\{<ResetPassword \/>\}/)
  const page = read('pages/ResetPassword.tsx')
  expect(page).toMatch(/<TopNav me=\{data\?\.me \?\? null\} \/>/)
  expect(page).toMatch(/<AuthShell place="customer" reset=\{reset\} onAuthenticated=\{\(\) => navigate\(HOME_HREF\)\}/)
  expect(page).toMatch(/params\.get\('token'\)[\s\S]*params\.get\('email'\)/)
  expect(shell).toMatch(/useState<Pane>\(reset \? 'reset' : initialMode\)/)
  expect(shell).toMatch(/auth\.newPassword[\s\S]*minLength=\{8\}/)
  expect(shell).toMatch(/RESET_PASSWORD_MUTATION, \{ refetchQueries: \['Me'\] \}/)
  expect(shell).toMatch(/go\('login'\)\s*setEmail\(reset\.email\)\s*setNotice\(t\('auth\.resetDone'\)\)/)
  expect(shell).toMatch(/'INVALID_RESET_TOKEN'[\s\S]*setResetInvalid\(true\)/)
  expect(shell).toMatch(/auth\.resetInvalid[\s\S]*go\('forgot'\)[\s\S]*auth\.resetAgain/)
  const i18n = read('i18n.ts')
  expect(i18n).toMatch(/newPassword: 'Nova lozinka'/)
  expect(i18n).toMatch(/resetDone: 'Lozinka je promijenjena\.'/)
  expect(i18n).toMatch(/resetInvalid: 'Link je istekao ili nije ispravan\.'/)
})

test('/reset-password top-nav slot is empty, greeting only when named', () => {
  expect(topNavChrome('/reset-password', null).slot).toBe('empty')
  expect(topNavChrome('/reset-password', { name: '', email: 'a@b.ba' }).slot).toBe('empty')
  expect(topNavChrome('/reset-password', { name: 'Ana', email: 'a@b.ba' })).toMatchObject({ slot: 'greeting', personName: 'Ana' })
})
