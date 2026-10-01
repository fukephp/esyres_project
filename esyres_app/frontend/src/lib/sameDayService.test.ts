// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import i18n from '../i18n'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')
const line = 'Već imaš ovu uslugu tog dana.'

test('same-day copy names no service', () => {
  expect(i18n.t('salon.gate.SAME_DAY_SERVICE')).toBe(line)
  expect(i18n.t('bookings.respondError.SAME_DAY_SERVICE')).toBe(line)
  expect(i18n.t('bookings.rescheduleError.SAME_DAY_SERVICE')).toBe(line)
  expect(line).not.toMatch(/Šišanje|\{\{/)
})

test('picker and chat map SAME_DAY_SERVICE and stay unsent', () => {
  const page = readFileSync(join(src, 'pages/SalonProfile.tsx'), 'utf8')
  expect(page).toMatch(/code === 'SAME_DAY_SERVICE'/)
  expect(page).toMatch(/salon\.gate\.SAME_DAY_SERVICE/)
  const send = page.slice(page.indexOf('async function send'), page.indexOf('function openIntake'))
  expect(send.indexOf("setMode('sent')")).toBeLessThan(send.indexOf('catch'))
  expect(send).toMatch(/error=\{error\}|setError\(gateMessage/)
})
