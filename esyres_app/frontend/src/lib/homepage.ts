import { CREATE_SALON_PATH, ownerPanelCta, type PanelCta } from './createSalon'

export const DISCOVERY_HREF = '/salons'
export const CREATE_SALON_HREF = CREATE_SALON_PATH
export const HOME_HREF = '/'
export const BOOKINGS_HREF = '/bookings'
export const DISCOVERY_BRAND_KEY = 'pitch.brand' as const
export const GUEST_COLUMN_CLASS = 'mx-auto w-full max-w-[1200px] px-5 md:px-16'

export type TopNavSlot = 'home' | 'discovery' | 'empty' | 'session'

export type TopNavMe = {
  name: string | null | undefined
  email: string
  salons?: unknown[]
} | null

export type TopNavBrand = { to: typeof HOME_HREF; brandKey: typeof DISCOVERY_BRAND_KEY }

export type TopNavChrome =
  | { brand: TopNavBrand; slot: 'home-guest'; login: true; register: true; panel: PanelCta }
  | { brand: TopNavBrand; slot: 'home-session'; displayName: string; logout: true; panel: PanelCta }
  | { brand: TopNavBrand; slot: 'discovery'; bookings: true }
  | { brand: TopNavBrand; slot: 'empty' }
  | { brand: TopNavBrand; slot: 'session'; displayName: string; logout: true }

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

export function homepageDisplayName(me: { name: string | null | undefined; email: string }): string {
  const name = me.name?.trim() ?? ''
  return name !== '' ? name : me.email
}

export function topNavChrome(path: string, me: TopNavMe): TopNavChrome {
  const slot = topNavSlot(path)
  if (slot === 'home') {
    const panel = ownerPanelCta((me?.salons?.length ?? 0) > 0)
    if (me == null) {
      return { brand, slot: 'home-guest', login: true, register: true, panel }
    }
    return {
      brand,
      slot: 'home-session',
      displayName: homepageDisplayName(me),
      logout: true,
      panel,
    }
  }
  if (slot === 'discovery') {
    return { brand, slot: 'discovery', bookings: true }
  }
  if (slot === 'session' && me != null) {
    return { brand, slot: 'session', displayName: homepageDisplayName(me), logout: true }
  }
  return { brand, slot: 'empty' }
}

export type HomepageChrome =
  | { kind: 'guest'; login: true; register: true; panel: PanelCta }
  | { kind: 'session'; displayName: string; logout: true; panel: PanelCta }

export function homepageChrome(me: TopNavMe): HomepageChrome {
  if (me == null) {
    return { kind: 'guest', login: true, register: true, panel: ownerPanelCta(false) }
  }
  return {
    kind: 'session',
    displayName: homepageDisplayName(me),
    logout: true,
    panel: ownerPanelCta((me.salons?.length ?? 0) > 0),
  }
}

export function discoveryBrandLink(): { to: typeof HOME_HREF; brandKey: typeof DISCOVERY_BRAND_KEY } {
  return brand
}
