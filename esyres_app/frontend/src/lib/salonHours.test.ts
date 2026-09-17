import { expect, test } from 'vitest'
import type { AssistantDayHours } from './assistant'
import {
  applyHoursRowTap,
  formatPickerDayNumeric,
  hoursRowClosed,
  hoursRowSelected,
  hoursRowTappable,
  nextSarajevoDateForWeekday,
  sarajevoWeekdayFromYmd,
  showDaySendPill,
} from './salonHours'

const today = '2026-09-13'

const openMonday: AssistantDayHours = {
  weekday: 'MONDAY',
  closed: false,
  opensAt: '09:00',
  closesAt: '17:00',
  breakStartsAt: null,
  breakEndsAt: null,
}

const closedSunday: AssistantDayHours = {
  weekday: 'SUNDAY',
  closed: true,
  opensAt: null,
  closesAt: null,
  breakStartsAt: null,
  breakEndsAt: null,
}

test('nextSarajevoDateForWeekday is inclusive and does not skip a week after close', () => {
  expect(sarajevoWeekdayFromYmd(today)).toBe('SUNDAY')
  expect(nextSarajevoDateForWeekday('SUNDAY', today)).toBe('2026-09-13')
  expect(nextSarajevoDateForWeekday('MONDAY', today)).toBe('2026-09-14')
  expect(nextSarajevoDateForWeekday('SATURDAY', today)).toBe('2026-09-19')
})

test('hoursRowClosed follows assistantHoursFacts', () => {
  expect(hoursRowClosed(undefined)).toBe(true)
  expect(hoursRowClosed(closedSunday)).toBe(true)
  expect(hoursRowClosed({ ...openMonday, opensAt: null, closesAt: null, closed: false })).toBe(true)
  expect(hoursRowClosed(openMonday)).toBe(false)
})

test('hoursRowTappable only for open rows with services in idle picker or chat', () => {
  expect(hoursRowTappable({ closed: true, hasServices: true, mode: 'idle' })).toBe(false)
  expect(hoursRowTappable({ closed: false, hasServices: false, mode: 'idle' })).toBe(false)
  expect(hoursRowTappable({ closed: false, hasServices: true, mode: 'sent' })).toBe(false)
  expect(hoursRowTappable({ closed: false, hasServices: true, mode: 'idle' })).toBe(true)
  expect(hoursRowTappable({ closed: false, hasServices: true, mode: 'picker' })).toBe(true)
  expect(hoursRowTappable({ closed: false, hasServices: true, mode: 'chat' })).toBe(true)
})

test('hoursRowSelected matches weekday of preferredDate, including next week', () => {
  expect(hoursRowSelected({ tappable: true, rowWeekday: 'MONDAY', preferredDate: '' })).toBe(false)
  expect(hoursRowSelected({ tappable: false, rowWeekday: 'MONDAY', preferredDate: '2026-09-14' })).toBe(false)
  expect(hoursRowSelected({ tappable: true, rowWeekday: 'MONDAY', preferredDate: '2026-09-15' })).toBe(false)
  expect(hoursRowSelected({ tappable: true, rowWeekday: 'MONDAY', preferredDate: '2026-09-14' })).toBe(true)
  expect(hoursRowSelected({ tappable: true, rowWeekday: 'MONDAY', preferredDate: '2026-09-21' })).toBe(true)
})

test('applyHoursRowTap noops when not tappable or already selected', () => {
  expect(
    applyHoursRowTap({
      tappable: false,
      selected: false,
      weekday: 'MONDAY',
      today,
      preferredTime: '',
    }),
  ).toEqual({ noop: true })
  expect(
    applyHoursRowTap({
      tappable: true,
      selected: true,
      weekday: 'MONDAY',
      today,
      preferredTime: '10:00',
    }),
  ).toEqual({ noop: true })
})

test('applyHoursRowTap seeds next weekday from today and keeps time, without opening picker', () => {
  expect(
    applyHoursRowTap({
      tappable: true,
      selected: false,
      weekday: 'MONDAY',
      today,
      preferredTime: '',
    }),
  ).toEqual({
    preferredDate: '2026-09-14',
    preferredTime: '',
  })
  expect(
    applyHoursRowTap({
      tappable: true,
      selected: false,
      weekday: 'TUESDAY',
      today,
      preferredTime: '10:00',
    }),
  ).toEqual({
    preferredDate: '2026-09-15',
    preferredTime: '10:00',
  })
})

test('showDaySendPill needs a selected day, services, tappable row, and not chat or sent', () => {
  const open = {
    preferredDate: '2026-09-14',
    hasServices: true,
    chatting: false,
    sent: false,
    tappable: true,
  }
  expect(showDaySendPill({ ...open, preferredDate: '' })).toBe(false)
  expect(showDaySendPill(open)).toBe(true)
  expect(showDaySendPill({ ...open, hasServices: false })).toBe(false)
  expect(showDaySendPill({ ...open, chatting: true })).toBe(false)
  expect(showDaySendPill({ ...open, sent: true })).toBe(false)
  expect(showDaySendPill({ ...open, tappable: false })).toBe(false)
})

test('formatPickerDayNumeric is day. month. year without pad or trailing period', () => {
  expect(formatPickerDayNumeric('2026-09-17')).toBe('17. 9. 2026')
  expect(formatPickerDayNumeric('2026-09-07')).toBe('7. 9. 2026')
})
