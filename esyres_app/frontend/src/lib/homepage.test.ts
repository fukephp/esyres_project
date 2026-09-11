import { expect, test } from 'vitest'
import {
  CREATE_SALON_HREF,
  DISCOVERY_BRAND_KEY,
  DISCOVERY_HREF,
  HOME_HREF,
  discoveryBrandLink,
  homepageChrome,
  homepageDisplayName,
  isDiscoveryHomePath,
  isHomepagePath,
} from './homepage'

test('isHomepagePath is only / or empty', () => {
  expect(isHomepagePath('/')).toBe(true)
  expect(isHomepagePath('')).toBe(true)
  expect(isHomepagePath('/salons')).toBe(false)
  expect(isHomepagePath('/salon/1')).toBe(false)
  expect(isHomepagePath('/bookings')).toBe(false)
  expect(isHomepagePath('/owner')).toBe(false)
  expect(isHomepagePath('/owner/stats')).toBe(false)
  expect(isHomepagePath('/welcome')).toBe(false)
  expect(isHomepagePath('/create-salon')).toBe(false)
})

test('isDiscoveryHomePath is only /salons', () => {
  expect(isDiscoveryHomePath('/salons')).toBe(true)
  expect(isDiscoveryHomePath('/')).toBe(false)
  expect(isDiscoveryHomePath('')).toBe(false)
  expect(isDiscoveryHomePath('/salon/1')).toBe(false)
  expect(isDiscoveryHomePath('/bookings')).toBe(false)
  expect(isDiscoveryHomePath('/owner')).toBe(false)
  expect(isDiscoveryHomePath('/owner/stats')).toBe(false)
  expect(isDiscoveryHomePath('/welcome')).toBe(false)
  expect(isDiscoveryHomePath('/create-salon')).toBe(false)
})

test('homepageDisplayName prefers trimmed name else email', () => {
  expect(homepageDisplayName({ name: 'Ana', email: 'ana@example.com' })).toBe('Ana')
  expect(homepageDisplayName({ name: '  Ana  ', email: 'ana@example.com' })).toBe('Ana')
  expect(homepageDisplayName({ name: '', email: 'ana@example.com' })).toBe('ana@example.com')
  expect(homepageDisplayName({ name: '   ', email: 'ana@example.com' })).toBe('ana@example.com')
  expect(homepageDisplayName({ name: null, email: 'ana@example.com' })).toBe('ana@example.com')
  expect(homepageDisplayName({ name: undefined, email: 'ana@example.com' })).toBe('ana@example.com')
})

test('discovery and create-salon hrefs', () => {
  expect(DISCOVERY_HREF).toBe('/salons')
  expect(CREATE_SALON_HREF).toBe('/create-salon')
  expect(HOME_HREF).toBe('/')
})

test('homepageChrome guest vs session', () => {
  expect(homepageChrome(null)).toEqual({
    kind: 'guest',
    login: true,
    register: true,
    getPanel: '/create-salon',
  })
  expect(homepageChrome({ name: 'Ana', email: 'ana@example.com' })).toEqual({
    kind: 'session',
    displayName: 'Ana',
    logout: true,
    getPanel: '/create-salon',
  })
  expect(homepageChrome({ name: '  ', email: 'ana@example.com' })).toEqual({
    kind: 'session',
    displayName: 'ana@example.com',
    logout: true,
    getPanel: '/create-salon',
  })
})

test('discovery brand links home with Esyres wordmark key', () => {
  expect(discoveryBrandLink()).toEqual({ to: '/', brandKey: 'pitch.brand' })
  expect(DISCOVERY_BRAND_KEY).toBe('pitch.brand')
})

test('homepage chrome copy is Bosnian; pitch hero strings unchanged', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('pitch.brand')).toBe('Esyres')
  expect(i18n.t('pitch.h1')).toBe('Rezervacije bez jurnjave za terminom')
  expect(i18n.t('pitch.support')).toBe(
    'Odabereš dan i željeno vrijeme. Salon prihvati ili predloži drugo. Potvrdiš samo kad predlože drugačije vrijeme.',
  )
  expect(i18n.t('pitch.step1')).toBe('Odaberi dan i željeno vrijeme.')
  expect(i18n.t('pitch.step2')).toBe('Salon prihvati ili prilagodi.')
  expect(i18n.t('pitch.step3')).toBe('Potvrdiš samo ako predlože drugo vrijeme.')
  expect(i18n.t('pitch.cta')).toBe('Pronađi salon')
  expect(i18n.t('home.getPanel')).toBe('Imaš salon? Otvori panel')
  expect(i18n.t('home.logout')).toBe('Odjava')
  expect(i18n.t('home.footerCity')).toBe('Sarajevo')
  expect(i18n.t('home.footerLine')).toBe('Termini bez jurnjave.')
  expect(i18n.t('auth.login')).toBe('Prijava')
  expect(i18n.t('auth.register')).toBe('Registracija')
})
