export const DISCOVERY_HREF = '/salons'
export const CREATE_SALON_HREF = '/create-salon'
export const HOME_HREF = '/'
export const DISCOVERY_BRAND_KEY = 'pitch.brand' as const

export function isHomepagePath(path: string): boolean {
  return path === '/' || path === ''
}

export function isDiscoveryHomePath(path: string): boolean {
  return path === '/salons'
}

export function homepageDisplayName(me: { name: string | null | undefined; email: string }): string {
  const name = me.name?.trim() ?? ''
  return name !== '' ? name : me.email
}

export type HomepageChrome =
  | { kind: 'guest'; login: true; register: true; getPanel: typeof CREATE_SALON_HREF }
  | { kind: 'session'; displayName: string; logout: true; getPanel: typeof CREATE_SALON_HREF }

export function homepageChrome(me: { name: string | null | undefined; email: string } | null): HomepageChrome {
  if (me == null) {
    return { kind: 'guest', login: true, register: true, getPanel: CREATE_SALON_HREF }
  }
  return {
    kind: 'session',
    displayName: homepageDisplayName(me),
    logout: true,
    getPanel: CREATE_SALON_HREF,
  }
}

export function discoveryBrandLink(): { to: typeof HOME_HREF; brandKey: typeof DISCOVERY_BRAND_KEY } {
  return { to: HOME_HREF, brandKey: DISCOVERY_BRAND_KEY }
}
