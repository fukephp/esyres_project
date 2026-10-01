import { expect, test } from 'vitest'
import type { AssistantDayHours } from './assistant'
import {
  formatPickerDayNumeric,
  guestAfterServiceChange,
  guestDayChange,
  guestHoursSkip,
  hoursHaveOpenQuarter,
  hoursRowClosed,
  nextSarajevoDateForWeekday,
  sarajevoWeekdayFromYmd,
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

test('hoursHaveOpenQuarter ignores duration, past, and a break that does not cover every tick', () => {
  expect(hoursHaveOpenQuarter(undefined)).toBe(false)
  expect(hoursHaveOpenQuarter(closedSunday)).toBe(false)
  expect(hoursHaveOpenQuarter({ ...openMonday, opensAt: null, closesAt: null, closed: false })).toBe(false)
  expect(hoursHaveOpenQuarter(openMonday)).toBe(true)
  expect(hoursHaveOpenQuarter({ ...openMonday, opensAt: '09:00', closesAt: '09:10' })).toBe(true)
  expect(hoursHaveOpenQuarter({ ...openMonday, opensAt: '09:07', closesAt: '09:10' })).toBe(false)
  expect(
    hoursHaveOpenQuarter({ ...openMonday, opensAt: '12:00', closesAt: '13:00', breakStartsAt: '12:00', breakEndsAt: '13:00' }),
  ).toBe(false)
  expect(
    hoursHaveOpenQuarter({ ...openMonday, opensAt: '09:00', closesAt: '17:00', breakStartsAt: '12:00', breakEndsAt: '13:00' }),
  ).toBe(true)
})

test('guestHoursSkip picks the first open day in the next 7 and does not store a later day', () => {
  const names = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  const hours = (open: string[]): AssistantDayHours[] =>
    names.map((weekday) =>
      open.includes(weekday) ? { ...openMonday, weekday } : { ...closedSunday, weekday },
    )

  expect(guestHoursSkip(today, hours(['SUNDAY']))).toEqual({ chip: 'today', date: '2026-09-13' })
  expect(guestHoursSkip(today, hours(['MONDAY']))).toEqual({ chip: 'tomorrow', date: '2026-09-14' })
  expect(guestHoursSkip(today, hours(['TUESDAY']))).toEqual({ chip: 'other', date: '' })
  expect(guestHoursSkip(today, hours([]))).toEqual({ chip: 'today', date: '2026-09-13' })
})

test('guestDayChange clears the start and worker; Drugi dan clears the date', () => {
  expect(guestDayChange(today, { chip: 'today' })).toEqual({
    chip: 'today',
    date: '2026-09-13',
    time: '',
    workerId: '',
  })
  expect(guestDayChange(today, { chip: 'tomorrow' })).toEqual({
    chip: 'tomorrow',
    date: '2026-09-14',
    time: '',
    workerId: '',
  })
  expect(guestDayChange(today, { chip: 'other' })).toEqual({
    chip: 'other',
    date: '',
    time: '',
    workerId: '',
  })
  expect(guestDayChange(today, { date: '2026-09-13' })).toEqual({
    chip: 'today',
    date: '2026-09-13',
    time: '',
    workerId: '',
  })
  expect(guestDayChange(today, { date: '2026-09-14' })).toEqual({
    chip: 'tomorrow',
    date: '2026-09-14',
    time: '',
    workerId: '',
  })
  expect(guestDayChange(today, { date: '2026-09-16' })).toEqual({
    chip: 'other',
    date: '2026-09-16',
    time: '',
    workerId: '',
  })
})

test('guestAfterServiceChange keeps a tappable start and does not touch the day', () => {
  expect(guestAfterServiceChange('10:00', ['09:00', '10:00'])).toBe('10:00')
  expect(guestAfterServiceChange('10:00', ['09:00'])).toBe('')
  expect(guestAfterServiceChange('', ['09:00'])).toBe('')
})

test('formatPickerDayNumeric is day. month. year without pad or trailing period', () => {
  expect(formatPickerDayNumeric('2026-09-17')).toBe('17. 9. 2026')
  expect(formatPickerDayNumeric('2026-09-07')).toBe('7. 9. 2026')
})
