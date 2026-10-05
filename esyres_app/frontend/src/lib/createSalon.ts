export const CREATE_SALON_PATH = '/create-salon'

export type CreateSalonMe = {
  emailVerified: boolean
  salons: unknown[]
  isAdmin?: boolean
  hasPendingSalon?: boolean
  hasSentBooking?: boolean
  salonRejected?: boolean
} | null

export type CreateSalonSurface = 'auth' | 'verify' | 'form' | 'rejected' | 'redirect-owner' | 'redirect-admin' | 'pending' | 'booked'

export function createSalonSurface(me: CreateSalonMe): CreateSalonSurface {
  if (me == null) {
    return 'auth'
  }
  if (me.isAdmin) {
    return 'redirect-admin'
  }
  if (me.salons.length > 0) {
    return 'redirect-owner'
  }
  if (!me.emailVerified) {
    return 'verify'
  }
  if (me.hasPendingSalon) {
    return 'pending'
  }
  if (me.hasSentBooking) {
    return 'booked'
  }
  if (me.salonRejected) {
    return 'rejected'
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
