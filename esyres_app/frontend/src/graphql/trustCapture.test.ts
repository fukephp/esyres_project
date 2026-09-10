import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const banned = ['markNoShow', 'noShowCount', 'cancelCount', 'lateCancelCount', 'noShowAt']

test('PWA GraphQL documents omit trust capture fields', () => {
  const files = readdirSync(dir).filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
  expect(files.length).toBeGreaterThan(0)
  for (const file of files) {
    const text = readFileSync(join(dir, file), 'utf8')
    for (const name of banned) {
      expect(text, `${file} contains ${name}`).not.toMatch(new RegExp(`\\b${name}\\b`))
    }
  }
})
