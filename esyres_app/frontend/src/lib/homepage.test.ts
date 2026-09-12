import { expect, test } from 'vitest'
import {
  BOOKINGS_HREF,
  CREATE_SALON_HREF,
  DISCOVERY_BRAND_KEY,
  DISCOVERY_HREF,
  GUEST_COLUMN_CLASS,
  HOME_HREF,
  discoveryBrandLink,
  homepageChrome,
  homepageDisplayName,
  isBookingsPath,
  isCreateSalonPath,
  isDiscoveryHomePath,
  isHomepagePath,
  isOwnerPath,
  isSalonProfilePath,
  topNavChrome,
  topNavSlot,
} from './homepage'

test('GUEST_COLUMN_CLASS is the Design 1 1200px inner', () => {
  expect(GUEST_COLUMN_CLASS).toBe('mx-auto w-full max-w-[1200px] px-5 md:px-16')
})

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

test('path helpers for salon, create-salon, bookings, owner', () => {
  expect(isSalonProfilePath('/salon/1')).toBe(true)
  expect(isSalonProfilePath('/salon/abc-2')).toBe(true)
  expect(isSalonProfilePath('/salons')).toBe(false)
  expect(isSalonProfilePath('/salon/1/extra')).toBe(false)
  expect(isCreateSalonPath('/create-salon')).toBe(true)
  expect(isCreateSalonPath('/owner')).toBe(false)
  expect(isBookingsPath('/bookings')).toBe(true)
  expect(isBookingsPath('/bookings/1')).toBe(false)
  expect(isOwnerPath('/owner')).toBe(true)
  expect(isOwnerPath('/owner/chats')).toBe(true)
  expect(isOwnerPath('/owner/stats')).toBe(true)
  expect(isOwnerPath('/owner/requests/9')).toBe(true)
  expect(isOwnerPath('/bookings')).toBe(false)
})

test('topNavSlot by path', () => {
  expect(topNavSlot('/')).toBe('home')
  expect(topNavSlot('')).toBe('home')
  expect(topNavSlot('/salons')).toBe('discovery')
  expect(topNavSlot('/salon/1')).toBe('discovery')
  expect(topNavSlot('/create-salon')).toBe('empty')
  expect(topNavSlot('/bookings')).toBe('session')
  expect(topNavSlot('/owner')).toBe('session')
  expect(topNavSlot('/owner/chats')).toBe('session')
  expect(topNavSlot('/owner/stats')).toBe('session')
  expect(topNavSlot('/owner/requests/9')).toBe('session')
  expect(topNavSlot('/welcome')).toBe('empty')
  expect(topNavSlot('/nope')).toBe('empty')
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
  expect(BOOKINGS_HREF).toBe('/bookings')
})

const ana = { name: 'Ana', email: 'ana@example.com', salons: [] as unknown[] }
const owner = { name: 'Ana', email: 'ana@example.com', salons: [{ id: '1' }] }
const brand = { to: '/', brandKey: 'pitch.brand' } as const

test('homepageChrome guest vs session uses ownerPanelCta', () => {
  expect(homepageChrome(null)).toEqual({
    kind: 'guest',
    login: true,
    register: true,
    panel: { href: '/create-salon', kind: 'create' },
  })
  expect(homepageChrome(ana)).toEqual({
    kind: 'session',
    displayName: 'Ana',
    logout: true,
    panel: { href: '/create-salon', kind: 'create' },
  })
  expect(homepageChrome({ name: '  ', email: 'ana@example.com' })).toEqual({
    kind: 'session',
    displayName: 'ana@example.com',
    logout: true,
    panel: { href: '/create-salon', kind: 'create' },
  })
  expect(homepageChrome(owner)).toEqual({
    kind: 'session',
    displayName: 'Ana',
    logout: true,
    panel: { href: '/owner', kind: 'panel' },
  })
})

test('topNavChrome brand is always home; slots match path + me', () => {
  expect(topNavChrome('/', null)).toEqual({
    brand,
    slot: 'home-guest',
    login: true,
    register: true,
    panel: { href: '/create-salon', kind: 'create' },
  })
  expect(topNavChrome('/', owner)).toEqual({
    brand,
    slot: 'home-session',
    displayName: 'Ana',
    logout: true,
    panel: { href: '/owner', kind: 'panel' },
  })
  expect(topNavChrome('/salons', owner)).toEqual({ brand, slot: 'discovery', bookings: true })
  expect(topNavChrome('/salon/1', null)).toEqual({ brand, slot: 'discovery', bookings: true })
  expect(topNavChrome('/create-salon', owner)).toEqual({ brand, slot: 'empty' })
  expect(topNavChrome('/bookings', null)).toEqual({ brand, slot: 'empty' })
  expect(topNavChrome('/bookings', ana)).toEqual({
    brand,
    slot: 'session',
    displayName: 'Ana',
    logout: true,
  })
  expect(topNavChrome('/owner', owner)).toEqual({
    brand,
    slot: 'session',
    displayName: 'Ana',
    logout: true,
  })
  expect(topNavChrome('/owner/chats', null)).toEqual({ brand, slot: 'empty' })
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
  expect(i18n.t('home.panel')).toBe('Panel')
  expect(i18n.t('home.logout')).toBe('Odjava')
  expect(i18n.t('nav.bookings')).toBe('Moje rezervacije')
  expect(i18n.t('bookings.logout')).toBe('Odjavi se')
  expect(i18n.t('home.footerCity')).toBe('Sarajevo')
  expect(i18n.t('home.footerLine')).toBe('Termini bez jurnjave.')
  expect(i18n.t('auth.login')).toBe('Prijava')
  expect(i18n.t('auth.register')).toBe('Registracija')
})
