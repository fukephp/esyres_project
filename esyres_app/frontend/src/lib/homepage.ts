import { CREATE_SALON_PATH, ownerPanelCta, type PanelCta } from './createSalon'

export const DISCOVERY_HREF = '/salons'
export const CREATE_SALON_HREF = CREATE_SALON_PATH
export const HOME_HREF = '/'
export const BOOKINGS_HREF = '/bookings'
export const PROFILE_HREF = '/my-profile'
export const RESET_PASSWORD_PATH = '/reset-password'
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
  isAdmin?: boolean
} | null

export type TopNavBrand = { to: typeof HOME_HREF; brandKey: typeof DISCOVERY_BRAND_KEY }

export type TopNavChrome =
  | { brand: TopNavBrand; slot: 'home-guest'; login: true; register: true; panel: PanelCta }
  | { brand: TopNavBrand; slot: 'home-session'; personName: string | null; profile?: true; bookings: true; logout: true; panel: PanelCta }
  | { brand: TopNavBrand; slot: 'discovery'; personName: string | null; profile?: true; bookings: true }
  | { brand: TopNavBrand; slot: 'greeting'; personName: string }
  | { brand: TopNavBrand; slot: 'empty' }
  | { brand: TopNavBrand; slot: 'session'; personName: string | null; logout: true }
  | { brand: TopNavBrand; slot: 'customer-session'; personName: string | null; profile?: true; bookings: true; logout: true }
  | { brand: TopNavBrand; slot: 'admin'; personName: string | null; logout: true }

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

export function isProfilePath(path: string): boolean {
  return path === PROFILE_HREF || path === `${PROFILE_HREF}/settings`
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
  if (isBookingsPath(path) || isProfilePath(path)) {
    return 'session'
  }
  if (isOwnerPath(path)) {
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

export function isOwnerMe(me: { salons?: unknown[] } | null | undefined): boolean {
  return (me?.salons?.length ?? 0) > 0
}

export function afterHomepageAuthHref(me: { salons?: unknown[]; isAdmin?: boolean } | null | undefined): string {
  if (me?.isAdmin) {
    return '/admin/dashboard'
  }
  return isOwnerMe(me) ? '/owner' : PROFILE_HREF
}

export function topNavChrome(path: string, me: TopNavMe): TopNavChrome {
  const slot = topNavSlot(path)
  const personName = homepagePersonName(me)
  if (me?.isAdmin) {
    return { brand, slot: 'admin', personName, logout: true }
  }
  const profile = me != null && !isOwnerMe(me) ? { profile: true as const } : {}
  if (slot === 'home') {
    const panel = ownerPanelCta(isOwnerMe(me))
    if (me == null) {
      return { brand, slot: 'home-guest', login: true, register: true, panel }
    }
    return {
      brand,
      slot: 'home-session',
      personName,
      ...profile,
      bookings: true,
      logout: true,
      panel,
    }
  }
  if (slot === 'discovery') {
    return { brand, slot: 'discovery', personName, ...profile, bookings: true }
  }
  if (slot === 'session' && me != null) {
    if (isOwnerPath(path)) {
      return { brand, slot: 'session', personName, logout: true }
    }
    return { brand, slot: 'customer-session', personName, ...profile, bookings: true, logout: true }
  }
  if ((isCreateSalonPath(path) || path === RESET_PASSWORD_PATH) && personName != null) {
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
