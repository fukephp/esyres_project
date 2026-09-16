import { expect, test } from 'vitest'
import {
  acceptErrorKey,
  canAcceptPreferredTime,
  canDropOnStart,
  cellKind,
  hoursForDate,
  isFifteenMinute,
  isPreferredSoon,
  occupyingBlock,
  occupyingColSpan,
  currentJobLabel,
  overlayQueueChrome,
  ownerDateFromSearch,
  ownerQueuePath,
  ownerChatPath,
  ownerStatsPath,
  ownerSalonsPath,
  ownerSalonCreatePath,
  ownerSalonEditPath,
  OWNER_SALONS_PATH,
  salonIsOpenNow,
  statsHourLabel,
  ownerSalonFromSearch,
  panelCells,
  proposeErrorKey,
  proposeStartTimes,
  queueRowClock,
  declineErrorKey,
  trimDeclineReason,
  sarajevoWeekday,
  assistantOriginVisible,
  assistantTranscriptLines,
  toSalonHoursInput,
  hoursAccordionSummary,
  kmToFeninga,
  feningaToKm,
} from './owner'

test('omit or invalid date falls back to Sarajevo today', () => {
  expect(ownerDateFromSearch(null, '2026-08-29')).toBe('2026-08-29')
  expect(ownerDateFromSearch('nope', '2026-08-29')).toBe('2026-08-29')
  expect(ownerDateFromSearch('2026-02-31', '2026-08-29')).toBe('2026-08-29')
  expect(ownerDateFromSearch('2026-08-31', '2026-08-29')).toBe('2026-08-31')
})

test('preferred time is soon when past or within two hours', () => {
  const now = new Date('2026-08-29T07:00:00.000Z')
  expect(isPreferredSoon('2026-08-29T09:00:00.000Z', now)).toBe(true)
  expect(isPreferredSoon('2026-08-29T06:00:00.000Z', now)).toBe(true)
  expect(isPreferredSoon('2026-08-29T09:00:01.000Z', now)).toBe(false)
})

test('Prihvati only when the request has a worker', () => {
  expect(canAcceptPreferredTime({ id: '1' })).toBe(true)
  expect(canAcceptPreferredTime(null)).toBe(false)
})

test('overlay queue chrome', () => {
  expect(overlayQueueChrome(true)).toEqual({
    tag: true,
    clock: 'reschedule',
    draggable: false,
    propose: false,
    decline: false,
    acceptPreferred: false,
    acceptReschedule: true,
    dismiss: true,
  })
  expect(overlayQueueChrome(false)).toEqual({
    tag: false,
    clock: 'preferred',
    draggable: true,
    propose: true,
    decline: true,
    acceptPreferred: true,
    acceptReschedule: false,
    dismiss: false,
  })
})

test('overlay queue clock uses reschedule start', () => {
  expect(
    queueRowClock({
      reschedulePending: true,
      rescheduleStartsAt: '2026-08-31T12:00:00.000Z',
      preferredStartsAt: '2026-08-29T09:00:00.000Z',
    }),
  ).toBe('2026-08-31T12:00:00.000Z')
  expect(
    queueRowClock({
      reschedulePending: false,
      rescheduleStartsAt: '2026-08-31T12:00:00.000Z',
      preferredStartsAt: '2026-08-29T09:00:00.000Z',
    }),
  ).toBe('2026-08-29T09:00:00.000Z')
})

test('accept error keys', () => {
  expect(acceptErrorKey('SLOT_TAKEN')).toBe('SLOT_TAKEN')
  expect(acceptErrorKey('NOT_REQUESTED')).toBe('NOT_REQUESTED')
  expect(acceptErrorKey('NOT_RESCHEDULE')).toBe('NOT_RESCHEDULE')
  expect(acceptErrorKey('WORKER_REQUIRED')).toBe('fallback')
  expect(acceptErrorKey(null)).toBe('fallback')
})

test('propose error keys', () => {
  expect(proposeErrorKey('OUTSIDE_HOURS')).toBe('OUTSIDE_HOURS')
  expect(proposeErrorKey('PAST_TIME')).toBe('PAST_TIME')
  expect(proposeErrorKey('INVALID_WORKER')).toBe('INVALID_WORKER')
  expect(proposeErrorKey('SLOT_TAKEN')).toBe('SLOT_TAKEN')
  expect(proposeErrorKey('nope')).toBe('fallback')
})

test('trim decline reason', () => {
  expect(trimDeclineReason('')).toBeNull()
  expect(trimDeclineReason('   ')).toBeNull()
  expect(trimDeclineReason('  Zatvoreno  ')).toBe('Zatvoreno')
})

test('decline error keys', () => {
  expect(declineErrorKey('NOT_REQUESTED')).toBe('NOT_REQUESTED')
  expect(declineErrorKey('REASON_TOO_LONG')).toBe('REASON_TOO_LONG')
  expect(declineErrorKey('SLOT_TAKEN')).toBe('fallback')
  expect(declineErrorKey(null)).toBe('fallback')
})

test('15-minute step', () => {
  expect(isFifteenMinute('14:00')).toBe(true)
  expect(isFifteenMinute('14:15')).toBe(true)
  expect(isFifteenMinute('14:07')).toBe(false)
  expect(isFifteenMinute('nope')).toBe(false)
})

test('grid window from hours', () => {
  expect(sarajevoWeekday('2026-08-29')).toBe('SATURDAY')
  expect(panelCells({ weekday: 'SUNDAY', closed: true, opensAt: null, closesAt: null, breakStartsAt: null, breakEndsAt: null })).toEqual([])
  const open = {
    weekday: 'SATURDAY',
    closed: false,
    opensAt: '09:00',
    closesAt: '10:00',
    breakStartsAt: '09:30',
    breakEndsAt: '09:45',
  }
  expect(panelCells(open).map((c) => `${c.time}:${c.off ? 'off' : 'on'}`)).toEqual([
    '09:00:on',
    '09:15:on',
    '09:30:off',
    '09:45:on',
  ])
  expect(hoursForDate([open], '2026-08-29')).toEqual(open)
})

test('start cell droppable only when free', () => {
  const blocks = [{ workerId: '1', start: '09:00', durationMinutes: 30, status: 'CONFIRMED' as const, label: '' }]
  expect(canDropOnStart(cellKind('09:00', false, blocks, '1'))).toBe(false)
  expect(canDropOnStart(cellKind('09:15', false, blocks, '1'))).toBe(false)
  expect(canDropOnStart(cellKind('09:30', false, blocks, '1'))).toBe(true)
  expect(canDropOnStart(cellKind('09:00', true, [], '1'))).toBe(false)
  expect(canDropOnStart(cellKind('09:00', false, blocks, '2'))).toBe(true)
  expect(cellKind('09:00', false, [{ ...blocks[0], status: 'TIME_PROPOSED' }], '1')).toBe('proposed')
})

test('propose start times are droppable starts for that worker', () => {
  const cells = [
    { time: '09:00', off: false },
    { time: '09:15', off: false },
    { time: '09:30', off: true },
    { time: '09:45', off: false },
  ]
  const blocks = [{ workerId: '1', start: '09:00', durationMinutes: 30, status: 'CONFIRMED' as const, label: '' }]
  expect(proposeStartTimes(cells, blocks, '1')).toEqual(['09:45'])
  expect(proposeStartTimes(cells, blocks, '2')).toEqual(['09:00', '09:15', '09:45'])
  expect(proposeStartTimes([], blocks, '1')).toEqual([])
})

test('owner queue path omits today', () => {
  expect(ownerQueuePath('2026-08-29', '2026-08-29')).toBe('/owner')
  expect(ownerQueuePath('2026-08-30', '2026-08-29')).toBe('/owner?date=2026-08-30')
})

test('salon from search falls back to first owned', () => {
  const salons = [{ id: '1' }, { id: '2' }]
  expect(ownerSalonFromSearch(null, salons)).toBe('1')
  expect(ownerSalonFromSearch('nope', salons)).toBe('1')
  expect(ownerSalonFromSearch('9', salons)).toBe('1')
  expect(ownerSalonFromSearch('2', salons)).toBe('2')
  expect(ownerSalonFromSearch('1', [])).toBeNull()
})

test('owner queue path omits first-owned salon and keeps date', () => {
  expect(ownerQueuePath('2026-08-29', '2026-08-29', '1', '1')).toBe('/owner')
  expect(ownerQueuePath('2026-08-29', '2026-08-29', '2', '1')).toBe('/owner?salon=2')
  expect(ownerQueuePath('2026-08-30', '2026-08-29', '1', '1')).toBe('/owner?date=2026-08-30')
  expect(ownerQueuePath('2026-08-30', '2026-08-29', '2', '1')).toBe('/owner?date=2026-08-30&salon=2')
})

test('owner chat path is not home and omits first-owned salon', () => {
  expect(ownerChatPath()).toBe('/owner/chats')
  expect(ownerChatPath('1', '1')).toBe('/owner/chats')
  expect(ownerChatPath('2', '1')).toBe('/owner/chats?salon=2')
})

test('owner stats path is not home and omits first-owned salon', () => {
  expect(ownerStatsPath()).toBe('/owner/stats')
  expect(ownerStatsPath('1', '1')).toBe('/owner/stats')
  expect(ownerStatsPath('2', '1')).toBe('/owner/stats?salon=2')
})

test('owner salons path never has a query', () => {
  expect(OWNER_SALONS_PATH).toBe('/owner/salons')
  expect(ownerSalonsPath()).toBe('/owner/salons')
})

test('owner salon edit path is /owner/salons/:id', () => {
  expect(ownerSalonEditPath('7')).toBe('/owner/salons/7')
})

test('owner salon create path is /owner/salons/create', () => {
  expect(ownerSalonCreatePath()).toBe('/owner/salons/create')
})

test('salonIsOpenNow uses Sarajevo clock, closes exclusive, skips breaks', () => {
  const monday = {
    weekday: 'MONDAY',
    closed: false,
    opensAt: '09:00',
    closesAt: '17:00',
    breakStartsAt: '12:00',
    breakEndsAt: '13:00',
  }
  const closed = {
    weekday: 'TUESDAY',
    closed: true,
    opensAt: null,
    closesAt: null,
    breakStartsAt: null,
    breakEndsAt: null,
  }
  const hours = [monday, closed]
  expect(salonIsOpenNow(hours, new Date('2026-08-31T07:00:00.000Z'))).toBe(true)
  expect(salonIsOpenNow(hours, new Date('2026-08-31T15:00:00.000Z'))).toBe(false)
  expect(salonIsOpenNow(hours, new Date('2026-08-31T10:00:00.000Z'))).toBe(false)
  expect(salonIsOpenNow(hours, new Date('2026-08-31T11:00:00.000Z'))).toBe(true)
  expect(salonIsOpenNow(hours, new Date('2026-09-01T10:00:00.000Z'))).toBe(false)
  expect(salonIsOpenNow(hours, new Date('2026-08-30T10:00:00.000Z'))).toBe(false)
  expect(salonIsOpenNow([], new Date('2026-08-31T10:00:00.000Z'))).toBe(false)
  expect(salonIsOpenNow([closed], new Date('2026-09-01T10:00:00.000Z'))).toBe(false)
})

test('toSalonHoursInput always emits Mon–Sun; closed days send no clocks', () => {
  const closedDay = {
    weekday: 'MONDAY',
    closed: true,
    opensAt: null,
    closesAt: null,
    breakStartsAt: null,
    breakEndsAt: null,
  }
  expect(toSalonHoursInput([])).toEqual([
    closedDay,
    { ...closedDay, weekday: 'TUESDAY' },
    { ...closedDay, weekday: 'WEDNESDAY' },
    { ...closedDay, weekday: 'THURSDAY' },
    { ...closedDay, weekday: 'FRIDAY' },
    { ...closedDay, weekday: 'SATURDAY' },
    { ...closedDay, weekday: 'SUNDAY' },
  ])
  const week = toSalonHoursInput([
    {
      weekday: 'MONDAY',
      closed: false,
      opensAt: '09:00:00',
      closesAt: '17:00:00',
      breakOn: true,
      breakStartsAt: '12:00:00',
      breakEndsAt: '13:00:00',
    },
    {
      weekday: 'TUESDAY',
      closed: true,
      opensAt: '09:00',
      closesAt: '17:00',
      breakOn: true,
      breakStartsAt: '12:00',
      breakEndsAt: '13:00',
    },
    {
      weekday: 'WEDNESDAY',
      closed: false,
      opensAt: '10:00',
      closesAt: '18:00',
      breakOn: false,
      breakStartsAt: '12:00',
      breakEndsAt: '13:00',
    },
  ])
  expect(week[0]).toEqual({
    weekday: 'MONDAY',
    closed: false,
    opensAt: '09:00',
    closesAt: '17:00',
    breakStartsAt: '12:00',
    breakEndsAt: '13:00',
  })
  expect(week[1]).toEqual({ ...closedDay, weekday: 'TUESDAY' })
  expect(week[2]).toEqual({
    weekday: 'WEDNESDAY',
    closed: false,
    opensAt: '10:00',
    closesAt: '18:00',
    breakStartsAt: null,
    breakEndsAt: null,
  })
})

test('hoursAccordionSummary is clock range without pauza', () => {
  expect(hoursAccordionSummary({ closed: true, opensAt: '09:00', closesAt: '17:00' })).toEqual({
    closed: true,
  })
  expect(hoursAccordionSummary({ closed: false, opensAt: '', closesAt: '17:00' })).toEqual({
    closed: true,
  })
  expect(hoursAccordionSummary({ closed: false, opensAt: '09:00', closesAt: '' })).toEqual({
    closed: true,
  })
  expect(
    hoursAccordionSummary({
      closed: false,
      opensAt: '09:00:00',
      closesAt: '17:00:00',
    }),
  ).toEqual({ closed: false, range: '09:00–17:00' })
  const withPauza = {
    weekday: 'WEDNESDAY',
    closed: false,
    opensAt: '10:00',
    closesAt: '18:00',
    breakOn: true,
    breakStartsAt: '12:00',
    breakEndsAt: '13:00',
  }
  expect(hoursAccordionSummary(withPauza)).toEqual({ closed: false, range: '10:00–18:00' })
})

test('kmToFeninga parses KM to integer feninga', () => {
  expect(kmToFeninga('')).toBeNull()
  expect(kmToFeninga('  ')).toBeNull()
  expect(kmToFeninga('nope')).toBeNull()
  expect(kmToFeninga('-1')).toBeNull()
  expect(kmToFeninga('0')).toBe(0)
  expect(kmToFeninga('25')).toBe(2500)
  expect(kmToFeninga('25.50')).toBe(2550)
  expect(kmToFeninga('25,50')).toBe(2550)
  expect(feningaToKm(2500)).toBe('25')
  expect(feningaToKm(2550)).toBe('25.5')
})

test('owner catalog copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('owner.salons')).toBe('Saloni')
  expect(i18n.t('owner.openNow')).toBe('Otvoreno')
  expect(i18n.t('owner.closedNow')).toBe('Zatvoreno')
  expect(i18n.t('owner.salonName')).toBe('Ime salona')
  expect(i18n.t('owner.info')).toBe('Informacije')
  expect(i18n.t('owner.address')).toBe('Adresa')
  expect(i18n.t('owner.save')).toBe('Spremi')
  expect(i18n.t('owner.addSalon')).toBe('Dodaj salon')
  expect(i18n.t('owner.opens')).toBe('Od')
  expect(i18n.t('owner.closes')).toBe('Do')
  expect(i18n.t('owner.break')).toBe('Pauza')
  expect(i18n.t('owner.cancellationNotice')).toBe('Rok za otkaz (sati)')
  expect(i18n.t('owner.INVALID_NAME')).toBe('Unesi ime salona.')
  expect(i18n.t('owner.INVALID_ADDRESS')).toBe('Unesi adresu.')
  expect(i18n.t('owner.INVALID_HOURS')).toBe('Radno vrijeme nije ispravno.')
  expect(i18n.t('owner.serviceName')).toBe('Ime usluge')
  expect(i18n.t('owner.duration')).toBe('Trajanje (min)')
  expect(i18n.t('owner.price')).toBe('Cijena (KM)')
  expect(i18n.t('owner.addService')).toBe('Dodaj')
  expect(i18n.t('owner.INVALID_SERVICE_NAME')).toBe('Unesi ime usluge.')
  expect(i18n.t('owner.INVALID_DURATION')).toBe('Trajanje mora biti 15 min ili više (korak 15).')
  expect(i18n.t('owner.INVALID_PRICE')).toBe('Cijena nije ispravna.')
  expect(i18n.t('owner.DUPLICATE_SERVICE_NAME')).toBe('Usluga s tim imenom već postoji.')
  expect(i18n.t('owner.categoryName')).toBe('Ime kategorije')
  expect(i18n.t('owner.addCategory')).toBe('Dodaj')
  expect(i18n.t('owner.deleteCategory')).toBe('Obriši')
  expect(i18n.t('owner.INVALID_CATEGORY_NAME')).toBe('Unesi ime kategorije.')
  expect(i18n.t('owner.DUPLICATE_CATEGORY_NAME')).toBe('Kategorija s tim imenom već postoji.')
  expect(i18n.t('owner.CATEGORY_NOT_EMPTY')).toBe('Prvo premjesti ili obriši usluge.')
  expect(i18n.t('owner.INVALID_CATEGORY')).toBe('Odaberi kategoriju ovog salona.')
  expect(i18n.t('owner.workers')).toBe('Radnici')
  expect(i18n.t('owner.workerName')).toBe('Ime radnika')
  expect(i18n.t('owner.addWorker')).toBe('Dodaj')
  expect(i18n.t('owner.INVALID_WORKER_NAME')).toBe('Unesi ime radnika.')
  expect(i18n.t('owner.DUPLICATE_WORKER_NAME')).toBe('Radnik s tim imenom već postoji.')
  expect(i18n.t('owner.noWorkers')).toBe('Nema radnika.')
  expect(i18n.t('owner.FORBIDDEN')).toBe('Salon nije tvoj.')
  expect(i18n.exists('owner.listed')).toBe(false)
})

test('owner stats copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('owner.stats')).toBe('Statistika')
  expect(i18n.t('owner.qrScans')).toBe('Skeniranja QR')
  expect(i18n.t('owner.qrVisits')).toBe('QR posjete')
  expect(i18n.t('owner.qrConversion')).toBe('Konverzija')
})

test('stats hour label is HH:00', () => {
  expect(statsHourLabel(0)).toBe('00:00')
  expect(statsHourLabel(9)).toBe('09:00')
  expect(statsHourLabel(14)).toBe('14:00')
})

test('assistant origin chip shows only when intake is present', () => {
  expect(assistantOriginVisible(null)).toBe(false)
  expect(assistantOriginVisible(undefined)).toBe(false)
  expect(assistantOriginVisible({ id: '1' })).toBe(true)
})

test('assistant transcript lines use snapshot date/time and booking names', () => {
  expect(
    assistantTranscriptLines({
      services: [{ name: 'Šišanje' }, { name: 'Farbanje' }],
      workerName: null,
      preferredDate: '2026-08-31',
      preferredTime: '10:00',
      noPreference: 'Nema preference',
    }),
  ).toEqual([
    { step: 'services', value: 'Šišanje, Farbanje' },
    { step: 'worker', value: 'Nema preference' },
    { step: 'date', value: '2026-08-31' },
    { step: 'time', value: '10:00' },
  ])
  expect(
    assistantTranscriptLines({
      services: [{ name: 'Šišanje' }],
      workerName: 'Lejla',
      preferredDate: '2026-08-31',
      preferredTime: '14:00',
      noPreference: 'Nema preference',
    }),
  ).toEqual([
    { step: 'services', value: 'Šišanje' },
    { step: 'worker', value: 'Lejla' },
    { step: 'date', value: '2026-08-31' },
    { step: 'time', value: '14:00' },
  ])
})

test('occupying block uses proposed fields for time proposed', () => {
  expect(
    occupyingBlock({
      status: 'TIME_PROPOSED',
      preferredStartsAt: '2026-08-29T09:00:00.000Z',
      proposedStartsAt: '2026-08-29T12:00:00.000Z',
      durationMinutes: 30,
      worker: { id: 'a' },
      proposedWorker: { id: 'b' },
      services: [{ name: 'Šišanje' }, { name: 'Boja' }],
    }),
  ).toEqual({
    workerId: 'b',
    start: '14:00',
    durationMinutes: 30,
    status: 'TIME_PROPOSED',
    label: 'Šišanje, Boja',
  })
})

test('occupying block labels confirmed from snapshots', () => {
  expect(
    occupyingBlock({
      status: 'CONFIRMED',
      preferredStartsAt: '2026-08-29T07:00:00.000Z',
      proposedStartsAt: null,
      durationMinutes: 45,
      worker: { id: 'a' },
      proposedWorker: null,
      services: [{ name: 'Masaža' }],
    }),
  ).toEqual({
    workerId: 'a',
    start: '09:00',
    durationMinutes: 45,
    status: 'CONFIRMED',
    label: 'Masaža',
  })
})

test('requested occupying block is null even with services', () => {
  expect(
    occupyingBlock({
      status: 'REQUESTED',
      preferredStartsAt: '2026-08-29T07:00:00.000Z',
      proposedStartsAt: null,
      durationMinutes: 30,
      worker: { id: 'a' },
      proposedWorker: null,
      services: [{ name: 'Šišanje' }],
    }),
  ).toBeNull()
})

test('current job label joins snapshot names', () => {
  expect(currentJobLabel([{ name: 'Šišanje' }, { name: 'Boja' }])).toBe('Šišanje, Boja')
  expect(currentJobLabel([])).toBe('')
  expect(currentJobLabel(undefined)).toBe('')
})

test('occupying colspan clips to remaining cells', () => {
  expect(occupyingColSpan(30, 4)).toBe(2)
  expect(occupyingColSpan(60, 1)).toBe(1)
  expect(occupyingColSpan(15, 8)).toBe(1)
})
