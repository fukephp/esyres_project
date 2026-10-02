// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const src = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string): string {
  return readFileSync(join(src, rel), 'utf8')
}

test('CloseButton is a black X icon labelled Zatvori; Spinner respects reduced motion', () => {
  const ui = read('components/ui.tsx')
  expect(ui).toMatch(/aria-label=\{t\('salon\.close'\)\}/)
  expect(ui).toMatch(/text-ink/)
  expect(ui).toMatch(/M6 6l12 12M18 6 6 18/)
  expect(ui).toMatch(/motion-safe:animate-spin/)
  expect(ui).toMatch(/role=\{variant === 'error' \? 'alert' : 'status'\}/)
})

test('checkbox, radio, and switch are custom-drawn in index.css', () => {
  const css = read('index.css')
  expect(css).not.toMatch(/accent-color/)
  expect(css).toMatch(/input\[type='checkbox'\],\s*input\[type='radio'\] \{\s*appearance: none/)
  expect(css).toMatch(/input\[type='checkbox'\]\[role='switch'\]:checked/)
})

test('salon edit uploads images through ImageUploadModal', () => {
  const page = read('pages/OwnerSalonEdit.tsx')
  expect(page).toMatch(/<ImageUploadModal/)
  expect(page).toMatch(/setUploadMode\('main'\)/)
  expect(page).toMatch(/setUploadMode\('gallery'\)/)
  expect(page).not.toMatch(/type="file"/)
  const modal = read('components/ImageUploadModal.tsx')
  expect(modal).toMatch(/onDrop=\{onDrop\}/)
  expect(modal).toMatch(/type="file"/)
  expect(modal).toMatch(/owner\.uploadSubmit/)
  expect(modal).toMatch(/<CloseButton/)
  expect(modal).toMatch(/<Spinner/)
})
