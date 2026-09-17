import { CREATE_SALON_PATH, ownerPanelCta, type PanelCta } from './createSalon'

export const DISCOVERY_HREF = '/salons'
export const CREATE_SALON_HREF = CREATE_SALON_PATH
export const HOME_HREF = '/'
export const BOOKINGS_HREF = '/bookings'
export const DISCOVERY_BRAND_KEY = 'pitch.brand' as const
export const GUEST_COLUMN_CLASS = 'mx-auto w-full max-w-[1200px] px-5 md:px-16'
export const PLACE_HEADING_CLASS = 'font-display text-[28px] font-semibold tracking-tight text-ink'

export type HomepageAuthMode = 'login' | 'register'

export function nextHomepageAuth(
  current: HomepageAuthMode | null,
  click: HomepageAuthMode,
): HomepageAuthMode | null {
  return current === click ? null : click
}

export type TopNavSlot = 'home' | 'discovery' | 'empty' | 'session'

export type TopNavMe = {
  name: string | null | undefined
  email: string
  salons?: unknown[]
} | null

export type TopNavBrand = { to: typeof HOME_HREF; brandKey: typeof DISCOVERY_BRAND_KEY }

export type TopNavChrome =
  | { brand: TopNavBrand; slot: 'home-guest'; login: true; register: true; panel: PanelCta }
  | { brand: TopNavBrand; slot: 'home-session'; personName: string | null; bookings: true; logout: true; panel: PanelCta }
  | { brand: TopNavBrand; slot: 'discovery'; personName: string | null; bookings: true }
  | { brand: TopNavBrand; slot: 'greeting'; personName: string }
  | { brand: TopNavBrand; slot: 'empty' }
  | { brand: TopNavBrand; slot: 'session'; personName: string | null; logout: true }

const brand: TopNavBrand = { to: HOME_HREF, brandKey: DISCOVERY_BRAND_KEY }

export function isHomepagePath(path: string): boolean {
  return path === '/' || path === ''
}

export function isDiscoveryHomePath(path: string): boolean {
  return path === '/salons'
}

export function isSalonProfilePath(path: string): boolean {
  return /^\/salon\/[^/]+$/.test(path)
}

export function isCreateSalonPath(path: string): boolean {
  return path === CREATE_SALON_PATH
}

export function isBookingsPath(path: string): boolean {
  return path === '/bookings'
}

export function isOwnerPath(path: string): boolean {
  return path === '/owner' || path.startsWith('/owner/')
}

export function topNavSlot(path: string): TopNavSlot {
  if (isHomepagePath(path)) {
    return 'home'
  }
  if (isDiscoveryHomePath(path) || isSalonProfilePath(path)) {
    return 'discovery'
  }
  if (isBookingsPath(path) || isOwnerPath(path)) {
    return 'session'
  }
  return 'empty'
}

export function homepagePersonName(
  me: { name: string | null | undefined } | null | undefined,
): string | null {
  const name = me?.name?.trim() ?? ''
  return name !== '' ? name : null
}

export function topNavChrome(path: string, me: TopNavMe): TopNavChrome {
  const slot = topNavSlot(path)
  const personName = homepagePersonName(me)
  if (slot === 'home') {
    const panel = ownerPanelCta((me?.salons?.length ?? 0) > 0)
    if (me == null) {
      return { brand, slot: 'home-guest', login: true, register: true, panel }
    }
    return {
      brand,
      slot: 'home-session',
      personName,
      bookings: true,
      logout: true,
      panel,
    }
  }
  if (slot === 'discovery') {
    return { brand, slot: 'discovery', personName, bookings: true }
  }
  if (slot === 'session' && me != null) {
    return { brand, slot: 'session', personName, logout: true }
  }
  if (isCreateSalonPath(path) && personName != null) {
    return { brand, slot: 'greeting', personName }
  }
  return { brand, slot: 'empty' }
}

export type HomepageChrome =
  | { kind: 'guest'; login: true; register: true; panel: PanelCta }
  | { kind: 'session'; personName: string | null; logout: true; panel: PanelCta }

export function homepageChrome(me: TopNavMe): HomepageChrome {
  if (me == null) {
    return { kind: 'guest', login: true, register: true, panel: ownerPanelCta(false) }
  }
  return {
    kind: 'session',
    personName: homepagePersonName(me),
    logout: true,
    panel: ownerPanelCta((me.salons?.length ?? 0) > 0),
  }
}

export function discoveryBrandLink(): { to: typeof HOME_HREF; brandKey: typeof DISCOVERY_BRAND_KEY } {
  return brand
}
