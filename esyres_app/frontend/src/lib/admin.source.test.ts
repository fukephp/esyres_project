// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('admin routes are the dashboard and the pending list', () => {
  const app = read('App.tsx')
  expect(app).toMatch(/path="\/admin" element=\{<Navigate to="\/admin\/dashboard" replace/)
  expect(app).toMatch(/path="\/admin\/dashboard" element=\{<AdminGate><AdminDashboard/)
  expect(app).toMatch(/path="\/admin\/na-odobrenju" element=\{<AdminGate><AdminPending/)
})

test('admin nav is Pregled then Na odobrenju and counts are not links', () => {
  const shell = read('components/AdminShell.tsx')
  expect(shell).toMatch(/admin\.overview[\s\S]*admin\.pending/)
  expect(shell).not.toMatch(/owner\.title|owner\.zapisi|owner\.chat|owner\.stats|owner\.salons|owner\.settings/)
  expect(shell).not.toMatch(/SalonSwitcher|Na čekanju ·/)
  const dash = read('pages/AdminDashboard.tsx')
  expect(dash).toMatch(/<dl/)
  expect(dash).not.toMatch(/<Link/)
  expect(dash).toMatch(/admin\.counts\.\$\{row\.key\}/)
  const pending = read('pages/AdminPending.tsx')
  expect(pending).toMatch(/admin\.empty/)
  expect(pending).toMatch(/type="button"[\s\S]*admin\.approve/)
  expect(pending).toMatch(/type="button"[\s\S]*admin\.reject/)
  expect(pending).not.toMatch(/confirm\(/)
  expect(pending).not.toMatch(/useNavigate/)
})

test('customer routes in the story send an admin to the dashboard', () => {
  expect(read('components/OwnerGate.tsx')).toMatch(/navigate\('\/admin\/dashboard', \{ replace: true \}\)/)
  expect(read('pages/CreateSalon.tsx')).toMatch(/redirect-admin[\s\S]*\/admin\/dashboard/)
  expect(read('pages/MyBookings.tsx')).toMatch(/isAdmin[\s\S]*\/admin\/dashboard/)
  expect(read('pages/MyProfile.tsx')).toMatch(/isAdmin[\s\S]*\/admin\/dashboard/)
})

test('salon profile hides send, save, and rating for an admin', () => {
  const salon = read('pages/SalonProfile.tsx')
  expect(salon).toMatch(/isAdmin === true \? null : \([\s\S]*salon\.send/)
  expect(salon).toMatch(/isAdmin !== true[\s\S]*salon\.save/)
  expect(salon).toMatch(/isAdmin === true \? null : \([\s\S]*<SalonRatingBlock/)
})

test('admin login from AuthShell goes to the dashboard', () => {
  const shell = read('components/AuthShell.tsx')
  expect(shell).toMatch(/loggedIn\?\.isAdmin[\s\S]*navigate\('\/admin\/dashboard', \{ replace: true \}\)/)
})

test('admin copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('admin.overview')).toBe('Pregled')
  expect(i18n.t('admin.pending')).toBe('Na odobrenju')
  expect(i18n.t('admin.empty')).toBe('Nema salona na čekanju.')
  expect(i18n.t('admin.approve')).toBe('Odobri')
  expect(i18n.t('admin.reject')).toBe('Odbij')
  expect(i18n.t('admin.counts.pending')).toBe('Na čekanju')
  expect(i18n.t('admin.counts.salons')).toBe('Saloni')
  expect(i18n.t('admin.counts.bookings')).toBe('Rezervacije')
})
