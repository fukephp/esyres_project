// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('Zahtjevi pending jump sits before Telefon and follows the queue refetch', () => {
  const home = read('pages/OwnerHome.tsx')
  const action = home.slice(home.indexOf('action={'), home.indexOf('{kanban ?'))
  expect(action).toMatch(/jump !== undefined && jump\.count > 0/)
  expect(action).toMatch(/bg-pastel-pink/)
  expect(action).toMatch(/owner\.pendingJump/)
  expect(action).toMatch(/nextPendingDay\(date, jump\.dates\)/)
  expect(action).toMatch(/onDate\(landed\)/)
  expect(action.indexOf('owner.pendingJump')).toBeLessThan(action.indexOf('owner.phone.button'))
  expect(action).not.toMatch(/hidden|md:hidden/)
  expect(home).toMatch(/const jump = jumpLoading \? undefined : jumpData\?\.pendingJump/)
  expect(home).toMatch(/function refetchAll\(\) \{\s*void refetchQueue\(\)\s*void refetchUnanswered\(\)\s*void refetchJump\(\)/)
  expect(home).toMatch(/PENDING_JUMP_QUERY, variables: \{ salonId: salon\.id \}/)
  const queueRow = home.slice(home.indexOf('function QueueRow'))
  expect(queueRow).toMatch(/onAccept/)
  expect(queueRow).toMatch(/onDeclineConfirm/)
  expect(queueRow).toMatch(/onDismissConfirm/)
  expect(queueRow).not.toMatch(/pendingJump/)
  expect(read('pages/OwnerZapisi.tsx')).not.toMatch(/pendingJump/)
  expect(read('pages/OwnerRequestDetail.tsx')).not.toMatch(/pendingJump/)
})
