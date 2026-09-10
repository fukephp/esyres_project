import { expect, test } from 'vitest'
import i18n from '../i18n'
import { customerPushClickPath, pushClickPath } from './push'

test('push click always includes salon', () => {
  expect(pushClickPath('2')).toBe('/owner?salon=2')
})

test('customer push click is bookings', () => {
  expect(customerPushClickPath()).toBe('/bookings')
})

test('push titles', () => {
  expect(i18n.t('owner.push.requested')).toBe('Novi zahtjev')
  expect(i18n.t('owner.push.confirmed')).toBe('Gost je prihvatio')
  expect(i18n.t('owner.push.rejected')).toBe('Gost je odbio')
  expect(i18n.t('owner.push.askOtherTime')).toBe('Gost traži drugo vrijeme')
  expect(i18n.t('owner.push.reschedule')).toBe('Gost traži premještaj')
})

test('customer push titles', () => {
  expect(i18n.t('bookings.push.timeProposed')).toBe('Predloženo vrijeme')
  expect(i18n.t('bookings.push.confirmed')).toBe('Potvrđeno')
  expect(i18n.t('bookings.push.declined')).toBe('Odbijeno')
})
