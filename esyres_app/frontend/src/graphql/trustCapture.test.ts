import type { DocumentNode } from 'graphql'
import { print } from 'graphql'
import { expect, test } from 'vitest'
import * as auth from './auth'
import * as booking from './booking'
import * as discovery from './discovery'
import * as intake from './intake'
import * as pending from './pending'
import * as salon from './salon'

const banned = ['markNoShow', 'noShowCount', 'cancelCount', 'lateCancelCount', 'noShowAt']

const modules: Record<string, Record<string, unknown>> = {
  auth,
  booking,
  discovery,
  intake,
  pending,
  salon,
}

function isDocument(value: unknown): value is DocumentNode {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'kind' in value &&
      (value as DocumentNode).kind === 'Document',
  )
}

test('PWA GraphQL documents omit trust capture fields', () => {
  const files = Object.keys(modules)
  expect(files.length).toBeGreaterThan(0)
  for (const [file, mod] of Object.entries(modules)) {
    const texts = Object.values(mod).filter(isDocument).map(print)
    expect(texts.length, `${file} has GraphQL documents`).toBeGreaterThan(0)
    const text = texts.join('\n')
    for (const name of banned) {
      expect(text, `${file} contains ${name}`).not.toMatch(new RegExp(`\\b${name}\\b`))
    }
  }
})
