import { expect, test } from 'vitest'
import {
  assistantBookingInput,
  assistantCanSend,
  assistantDateChange,
  assistantHoursForDate,
  assistantShowOtherTime,
  assistantStep,
  isChatOpen,
  isPickerOpen,
  showChatCta,
  skipWorkerStep,
  suggestPreferredTimes,
  type AssistantDayHours,
  type ProfileMode,
} from './assistant'

const openDay: AssistantDayHours = {
  weekday: 'SATURDAY',
  closed: false,
  opensAt: '09:00',
  closesAt: '17:00',
  breakStartsAt: null,
  breakEndsAt: null,
}

const lunchDay: AssistantDayHours = {
  ...openDay,
  breakStartsAt: '12:00',
  breakEndsAt: '13:00',
}

const closedDay: AssistantDayHours = {
  weekday: 'SUNDAY',
  closed: true,
  opensAt: null,
  closesAt: null,
  breakStartsAt: null,
  breakEndsAt: null,
}

function clocks(hoursForDay: AssistantDayHours | undefined, busyLevel: 'LOW' | 'MEDIUM' | 'HIGH') {
  return suggestPreferredTimes({ hoursForDay, busyLevel, date: '2026-09-05' })
}

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

test('closed weekday yields no suggestions and hides other-time even when busy is LOW', () => {
  expect(clocks(closedDay, 'LOW')).toEqual([])
  expect(clocks(undefined, 'LOW')).toEqual([])
  expect(assistantShowOtherTime(true)).toBe(false)
  expect(assistantCanSend(['1'], '2026-09-06', '')).toBe(false)
})

test('open day count follows busy-level; clocks snap to :00 or :30', () => {
  expect(clocks(openDay, 'LOW')).toEqual(['11:00', '13:00', '15:00'])
  expect(clocks(openDay, 'MEDIUM')).toEqual(['11:30', '14:30'])
  expect(clocks(openDay, 'HIGH')).toEqual(['13:00'])
  for (const level of ['LOW', 'MEDIUM', 'HIGH'] as const) {
    const times = clocks(openDay, level)
    const n = level === 'LOW' ? 3 : level === 'MEDIUM' ? 2 : 1
    expect(times.length).toBeGreaterThanOrEqual(1)
    expect(times.length).toBeLessThanOrEqual(n)
    for (const time of times) {
      expect(time).toMatch(/^\d{2}:(00|30)$/)
    }
  }
})

test('break is a hole; equal-distance snap picks the later mark', () => {
  expect(clocks(lunchDay, 'LOW')).toEqual(['11:00', '13:30', '15:30'])
  for (const time of clocks(lunchDay, 'LOW')) {
    expect(time >= '12:00' && time < '13:00').toBe(false)
  }
})

test('short window may return fewer than N clocks', () => {
  const short: AssistantDayHours = { ...openDay, opensAt: '10:00', closesAt: '11:00' }
  expect(clocks(short, 'LOW')).toEqual(['10:30'])
})

test('suggestions ignore duration and worker — those are not inputs', () => {
  expect(clocks(openDay, 'LOW')).toEqual(['11:00', '13:00', '15:00'])
})

test('today drops clocks strictly before now; equal-to-now stays; empty still allows other-time', () => {
  const today = '2026-09-05'
  expect(
    suggestPreferredTimes({
      hoursForDay: openDay,
      busyLevel: 'LOW',
      date: today,
      today,
      nowMinutes: 13 * 60,
    }),
  ).toEqual(['13:00', '15:00'])
  expect(
    suggestPreferredTimes({
      hoursForDay: openDay,
      busyLevel: 'LOW',
      date: today,
      today,
      nowMinutes: 16 * 60,
    }),
  ).toEqual([])
  expect(assistantShowOtherTime(false)).toBe(true)
})

test('changing date clears time and other-time mode', () => {
  expect(assistantDateChange('2026-09-06')).toEqual({
    preferredDate: '2026-09-06',
    preferredTime: '',
    otherTime: false,
  })
})

test('hoursForDate uses Sarajevo weekday', () => {
  expect(assistantHoursForDate([openDay, closedDay], '2026-09-05')).toEqual(openDay)
  expect(assistantHoursForDate([openDay, closedDay], '2026-09-06')).toEqual(closedDay)
})
