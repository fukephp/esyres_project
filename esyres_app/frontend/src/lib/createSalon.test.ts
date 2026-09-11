import { expect, test } from 'vitest'
import { CREATE_SALON_PATH, createSalonSurface, ownerPanelCta } from './createSalon'

test('CREATE_SALON_PATH is /create-salon', () => {
  expect(CREATE_SALON_PATH).toBe('/create-salon')
})

test('createSalonSurface is auth when me is null', () => {
  expect(createSalonSurface(null)).toBe('auth')
})

test('createSalonSurface redirects when the user already owns a salon', () => {
  expect(
    createSalonSurface({
      emailVerified: false,
      salons: [{ id: '1' }],
    }),
  ).toBe('redirect-owner')
  expect(
    createSalonSurface({
      emailVerified: true,
      salons: [{ id: '1' }],
    }),
  ).toBe('redirect-owner')
})

test('createSalonSurface is verify when signed in with no salons and unverified email', () => {
  expect(createSalonSurface({ emailVerified: false, salons: [] })).toBe('verify')
})

test('createSalonSurface is form when signed in, verified, with no salons', () => {
  expect(createSalonSurface({ emailVerified: true, salons: [] })).toBe('form')
})

test('ownerPanelCta is create vs panel', () => {
  expect(ownerPanelCta(false)).toEqual({ href: '/create-salon', kind: 'create' })
  expect(ownerPanelCta(true)).toEqual({ href: '/owner', kind: 'panel' })
})

test('create salon copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('createSalon.name')).toBe('Ime salona')
  expect(i18n.t('createSalon.submit')).toBe('Otvori panel')
  expect(i18n.t('createSalon.INVALID_NAME')).toBe('Unesi ime salona.')
  expect(i18n.t('home.panel')).toBe('Panel')
  expect(i18n.t('owner.createSalon')).toBe('Napravi salon')
  expect(i18n.t('pitch.brand')).toBe('Esyres')
})
