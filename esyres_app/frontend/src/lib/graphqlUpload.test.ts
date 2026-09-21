// @ts-nocheck — Node fs is not in the PWA tsconfig; Vitest runs this file.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, vi } from 'vitest'
import { graphqlUpload } from './graphqlUpload'

const pkg = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../package.json'), 'utf8')

test('package.json has no apollo-upload-client', () => {
  expect(pkg).not.toMatch(/apollo-upload-client/)
})

test('graphqlUpload posts multipart operations map and file', async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes('/sanctum/csrf-cookie')) {
      return new Response(null, { status: 204 })
    }
    const body = init?.body
    expect(body).toBeInstanceOf(FormData)
    const form = body as FormData
    expect(form.get('operations')).toContain('uploadSalonMainImage')
    expect(form.get('map')).toBe(JSON.stringify({ '0': ['variables.file'] }))
    expect(form.get('0')).toBeInstanceOf(File)
    return new Response(JSON.stringify({ data: { uploadSalonMainImage: { id: '1' } } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  const data = await graphqlUpload(
    'mutation { uploadSalonMainImage }',
    { salonId: '1' },
    new File(['x'], 'main.jpg', { type: 'image/jpeg' }),
  )
  expect(data).toEqual({ uploadSalonMainImage: { id: '1' } })
  expect(fetchMock).toHaveBeenCalledTimes(2)
  vi.unstubAllGlobals()
})

test('graphqlUpload throws graphQLErrors with code', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    if (String(input).includes('/sanctum/csrf-cookie')) {
      return new Response(null, { status: 204 })
    }
    return new Response(
      JSON.stringify({ errors: [{ message: 'nope', extensions: { code: 'GALLERY_FULL' } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }))
  await expect(
    graphqlUpload('mutation { x }', { salonId: '1' }, new File(['x'], 'a.jpg', { type: 'image/jpeg' })),
  ).rejects.toMatchObject({ graphQLErrors: [{ extensions: { code: 'GALLERY_FULL' } }] })
  vi.unstubAllGlobals()
})
