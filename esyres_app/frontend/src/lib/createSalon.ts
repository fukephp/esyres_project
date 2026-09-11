export const CREATE_SALON_PATH = '/create-salon'

export type CreateSalonMe = {
  emailVerified: boolean
  salons: unknown[]
} | null

export type CreateSalonSurface = 'auth' | 'verify' | 'form' | 'redirect-owner'

export function createSalonSurface(me: CreateSalonMe): CreateSalonSurface {
  if (me == null) {
    return 'auth'
  }
  if (me.salons.length > 0) {
    return 'redirect-owner'
  }
  if (!me.emailVerified) {
    return 'verify'
  }
  return 'form'
}

export type PanelCta = {
  href: '/create-salon' | '/owner'
  kind: 'create' | 'panel'
}

export function ownerPanelCta(ownsSalon: boolean): PanelCta {
  if (ownsSalon) {
    return { href: '/owner', kind: 'panel' }
  }
  return { href: '/create-salon', kind: 'create' }
}
