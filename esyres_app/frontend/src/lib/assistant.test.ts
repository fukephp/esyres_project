import { expect, test } from 'vitest'
import {
  assistantBookingInput,
  assistantCanSend,
  assistantStep,
  isChatOpen,
  isPickerOpen,
  showChatCta,
  skipWorkerStep,
  type ProfileMode,
} from './assistant'

test('hides chat CTA when catalog is empty or already sent', () => {
  expect(showChatCta(0, false)).toBe(false)
  expect(showChatCta(1, false)).toBe(true)
  expect(showChatCta(2, true)).toBe(false)
})

test('skips worker step when the salon has none', () => {
  expect(skipWorkerStep(0)).toBe(true)
  expect(skipWorkerStep(2)).toBe(false)
})

test('picker and chat are never both open', () => {
  const modes: ProfileMode[] = ['idle', 'picker', 'chat', 'sent']
  for (const mode of modes) {
    expect(isPickerOpen(mode) && isChatOpen(mode)).toBe(false)
  }
  expect(isPickerOpen('picker')).toBe(true)
  expect(isChatOpen('chat')).toBe(true)
})

test('canSend needs services, date, and time', () => {
  expect(assistantCanSend([], '2026-09-03', '14:00')).toBe(false)
  expect(assistantCanSend(['1'], '', '14:00')).toBe(false)
  expect(assistantCanSend(['1'], '2026-09-03', '')).toBe(false)
  expect(assistantCanSend(['1', '2'], '2026-09-03', '14:00')).toBe(true)
})

test('booking input matches picker createBooking shape and has no slots', () => {
  expect(
    assistantBookingInput({
      salonId: '9',
      serviceIds: [],
      workerChoice: '',
      preferredDate: '2026-09-03',
      preferredTime: '14:00',
    }),
  ).toBeNull()

  expect(
    assistantBookingInput({
      salonId: '9',
      serviceIds: ['1', '2'],
      workerChoice: '',
      preferredDate: '2026-09-03',
      preferredTime: '14:00',
    }),
  ).toEqual({
    salonId: '9',
    serviceIds: ['1', '2'],
    preferredDate: '2026-09-03',
    preferredTime: '14:00',
  })

  const named = assistantBookingInput({
    salonId: '9',
    serviceIds: ['1'],
    workerChoice: '12',
    preferredDate: '2026-09-03',
    preferredTime: '14:00',
  })
  expect(named).toEqual({
    salonId: '9',
    serviceIds: ['1'],
    workerId: '12',
    preferredDate: '2026-09-03',
    preferredTime: '14:00',
  })
  expect(named).not.toHaveProperty('slots')
})

test('steps skip worker when none; otherwise wait for a tap', () => {
  expect(
    assistantStep({
      serviceIds: [],
      workerCount: 2,
      workerConfirmed: false,
      preferredDate: '',
      preferredTime: '',
    }),
  ).toBe('services')

  expect(
    assistantStep({
      serviceIds: ['1'],
      workerCount: 0,
      workerConfirmed: false,
      preferredDate: '',
      preferredTime: '',
    }),
  ).toBe('date')

  expect(
    assistantStep({
      serviceIds: ['1'],
      workerCount: 2,
      workerConfirmed: false,
      preferredDate: '',
      preferredTime: '',
    }),
  ).toBe('worker')

  expect(
    assistantStep({
      serviceIds: ['1'],
      workerCount: 2,
      workerConfirmed: true,
      preferredDate: '',
      preferredTime: '',
    }),
  ).toBe('date')

  expect(
    assistantStep({
      serviceIds: ['1'],
      workerCount: 0,
      workerConfirmed: false,
      preferredDate: '2026-09-03',
      preferredTime: '',
    }),
  ).toBe('time')

  expect(
    assistantStep({
      serviceIds: ['1'],
      workerCount: 0,
      workerConfirmed: false,
      preferredDate: '2026-09-03',
      preferredTime: '14:00',
    }),
  ).toBe('send')
})
