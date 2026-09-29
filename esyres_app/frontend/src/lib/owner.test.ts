import { expect, test } from 'vitest'
import {
  acceptErrorKey,
  canAcceptPreferredTime,
  canDropOnStart,
  cellKind,
  formatOwnerDayHeading,
  hoursForDate,
  isFifteenMinute,
  isPreferredSoon,
  occupyingBlock,
  occupyingColSpan,
  currentJobLabel,
  overlayQueueChrome,
  ownerDateFromSearch,
  ownerQueuePath,
  ownerPhonePath,
  ownerZapisiPath,
  requestFromZapisiPath,
  zapisiOriginFromSearch,
  phoneFreeWorkerIds,
  phoneLegalStarts,
  phoneSkipDate,
  phoneDayChip,
  phoneAfterServiceChange,
  phoneWorkerSelection,
  phoneRangeOpen,
  queueChipInitial,
  shiftOwnerDate,
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
  WORKER_DOT_COLORS,
  workerDotColor,
  ownerMonthFromYmd,
  ownerMonthRange,
  shiftOwnerMonth,
  ownerMonthContains,
  ownerVisibleMonth,
  ownerMonthDays,
  ownerMonthWeekdayOffset,
  formatOwnerMonthTitle,
  occupyingClockRange,
  occupyingDiaryMeta,
  ownerDetailMode,
  occupyingSarajevoYmd,
  occupyingDotsForDay,
  selectedDayOccupying,
  mixRestWithBreak,
} from './owner'

test('omit or invalid date falls back to Sarajevo today', () => {
  expect(ownerDateFromSearch(null, '2026-08-29')).toBe('2026-08-29')
  expect(ownerDateFromSearch('nope', '2026-08-29')).toBe('2026-08-29')
  expect(ownerDateFromSearch('2026-02-31', '2026-08-29')).toBe('2026-08-29')
  expect(ownerDateFromSearch('2026-08-31', '2026-08-29')).toBe('2026-08-31')
})

test('owner day heading is Bosnian Intl without trailing period', () => {
  expect(formatOwnerDayHeading('2026-09-16')).toBe('srijeda, 16. septembar 2026')
})

test('shift owner date walks calendar days', () => {
  expect(shiftOwnerDate('2026-09-16', -1)).toBe('2026-09-15')
  expect(shiftOwnerDate('2026-09-30', 1)).toBe('2026-10-01')
})

test('queue chip initial is first trimmed letter', () => {
  expect(queueChipInitial(' Ana')).toBe('A')
  expect(queueChipInitial('')).toBe('?')
  expect(queueChipInitial('   ')).toBe('?')
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
  expect(hoursForDate([open], '')).toBeUndefined()
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

test('owner zapisi path omits today, first salon, and Svi', () => {
  expect(ownerZapisiPath('2026-08-29', '2026-08-29')).toBe('/owner/zapisi')
  expect(ownerZapisiPath('2026-08-30', '2026-08-29', '1', '1')).toBe('/owner/zapisi?date=2026-08-30')
  expect(ownerZapisiPath('2026-08-29', '2026-08-29', '2', '1')).toBe('/owner/zapisi?salon=2')
  expect(ownerZapisiPath('2026-08-29', '2026-08-29', '2', '1', 'phone')).toBe('/owner/zapisi?salon=2&origin=phone')
  expect(zapisiOriginFromSearch('nope')).toBeNull()
  expect(zapisiOriginFromSearch('assistant')).toBe('assistant')
  expect(requestFromZapisiPath('9', '2026-08-30', '2026-08-29', '2', '1', 'picker')).toBe(
    '/owner/requests/9?from=zapisi&date=2026-08-30&salon=2&origin=picker',
  )
  expect(requestFromZapisiPath('9', '2026-08-29', '2026-08-29')).toBe('/owner/requests/9?from=zapisi')
})

test('owner phone path keeps the return day and omits the first salon', () => {
  expect(ownerPhonePath('2026-08-29', '2026-08-29')).toBe('/owner/phone')
  expect(ownerPhonePath('2026-08-30', '2026-08-29', '1', '1')).toBe('/owner/phone?date=2026-08-30')
  expect(ownerPhonePath('2026-08-29', '2026-08-29', '2', '1')).toBe('/owner/phone?salon=2')
})

test('phone copy and free workers', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('owner.phone.button')).toBe('Telefon')
  expect(i18n.t('owner.phone.title')).toBe('Telefon')
  expect(i18n.t('owner.phone.next')).toBe('Dalje')
  expect(i18n.t('owner.phone.caller')).toBe('Pozivalac')
  expect(i18n.t('owner.phone.note')).toBe('Bilješka (opcionalno)')
  expect(i18n.t('owner.phone.noWorker')).toBe('Nema slobodnog radnika.')
  expect(i18n.t('owner.phone.today')).toBe('Danas')
  expect(i18n.t('owner.phone.tomorrow')).toBe('Sutra')
  expect(i18n.t('owner.phone.otherDay')).toBe('Drugi dan')
  expect(i18n.t('owner.phone.noStart')).toBe('Nema slobodnog termina.')
  expect(i18n.t('owner.phone.cancel')).toBe('Otkaži termin')
  expect(i18n.t('owner.phone.error.INVALID_CALLER_NAME')).toBe('Unesi ime.')
  expect(i18n.t('owner.phone.error.DURING_BREAK')).toBe('Termin pada u pauzu.')
  expect(i18n.t('owner.phone.error.SALON_CLOSED')).toBe('Salon je zatvoren taj dan.')
  expect(i18n.t('owner.phone.error.OUTSIDE_HOURS')).toBe('Van radnog vremena.')
  expect(i18n.t('owner.phone.error.SLOT_TAKEN')).toBe('Taj termin je zauzet.')
  expect(i18n.t('owner.phone.error.INVALID_WORKER')).toBe('Odaberi radnika ovog salona.')
  const day = {
    weekday: 'SATURDAY',
    closed: false,
    opensAt: '08:00',
    closesAt: '17:00',
    breakStartsAt: '13:00',
    breakEndsAt: '14:00',
  }
  expect(phoneRangeOpen(day, '10:00', 30)).toBe(true)
  expect(phoneRangeOpen(day, '13:30', 30)).toBe(false)
  const occupying = [
    {
      status: 'CONFIRMED',
      preferredStartsAt: '2026-08-29T08:00:00.000Z',
      proposedStartsAt: null,
      durationMinutes: 30,
      worker: { id: '1' },
      proposedWorker: null,
    },
  ]
  const ids = phoneFreeWorkerIds([{ id: '1' }, { id: '2' }], occupying, '10:00', 30, true)
  expect(ids).toEqual(['2'])
  const openDay = {
    weekday: 'SATURDAY',
    closed: false,
    opensAt: '08:00',
    closesAt: '12:00',
    breakStartsAt: null,
    breakEndsAt: null,
  }
  const starts = phoneLegalStarts(openDay, [{ id: '1' }], occupying, 30)
  expect(starts).toContain('08:00')
  expect(starts).not.toContain('10:00')
  expect(starts).toContain('10:30')
  expect(starts.every((start) => /:(00|15|30|45)$/.test(start))).toBe(true)
  const breakDay = {
    weekday: 'SATURDAY',
    closed: false,
    opensAt: '08:00',
    closesAt: '17:00',
    breakStartsAt: '13:00',
    breakEndsAt: '14:00',
  }
  const withBreak = phoneLegalStarts(breakDay, [{ id: '2' }], [], 30)
  expect(withBreak).not.toContain('12:45')
  expect(withBreak).not.toContain('13:00')
  expect(withBreak).toContain('14:00')
  expect(phoneLegalStarts({ ...openDay, closed: true }, [{ id: '1' }], [], 30)).toEqual([])
  const seen: string[] = []
  expect(
    phoneSkipDate('2026-09-29', (date) => {
      seen.push(date)
      return date === '2026-10-01'
    }),
  ).toBe('2026-10-01')
  expect(seen[0]).toBe('2026-09-29')
  expect(seen).not.toContain('2026-09-28')
  expect(phoneSkipDate('2026-09-29', () => false)).toBe('2026-09-29')
  expect(phoneDayChip('2026-09-29', '2026-09-29')).toBe('today')
  expect(phoneDayChip('2026-09-30', '2026-09-29')).toBe('tomorrow')
  expect(phoneDayChip('2026-10-01', '2026-09-29')).toBe('other')
  expect(phoneDayChip('2026-09-28', '2026-09-29')).toBe('other')
  expect(phoneAfterServiceChange('10:30', '1', ['10:30', '11:00'])).toEqual({ time: '10:30', workerId: '1' })
  expect(phoneAfterServiceChange('10:00', '1', ['10:30'])).toEqual({ time: '', workerId: '' })
  expect(phoneWorkerSelection(['1'], '')).toBe('1')
  expect(phoneWorkerSelection(['1', '2'], '')).toBe('')
  expect(phoneWorkerSelection(['1', '2'], '2')).toBe('2')
  expect(phoneWorkerSelection([], '1')).toBe('')
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
  expect(i18n.t('owner.description')).toBe('Opis')
  expect(i18n.t('owner.mainImage')).toBe('Glavna slika')
  expect(i18n.t('owner.gallery')).toBe('Galerija')
  expect(i18n.t('owner.removeImage')).toBe('Ukloni')
  expect(i18n.t('owner.addImage')).toBe('Dodaj sliku')
  expect(i18n.t('owner.INVALID_IMAGE_TYPE')).toBe('Dozvoljeni su JPEG, PNG i WebP.')
  expect(i18n.t('owner.IMAGE_TOO_LARGE')).toBe('Slika smije biti do 5 MB.')
  expect(i18n.t('owner.GALLERY_FULL')).toBe('Galerija prima najviše 6 slika.')
  expect(i18n.t('owner.DESCRIPTION_TOO_LONG')).toBe('Opis smije imati najviše 1000 znakova.')
  expect(i18n.t('owner.save')).toBe('Spremi')
  expect(i18n.t('owner.addSalon')).toBe('Dodaj salon')
  expect(i18n.t('owner.edit')).toBe('Uredi')
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
  expect(i18n.t('owner.empty')).toBe('Nema zahtjeva za ovaj dan.')
  expect(i18n.t('owner.closedDay')).toBe('Zatvoreno ovaj dan.')
  expect(i18n.t('owner.prevDay')).toBe('Prethodni dan')
  expect(i18n.t('owner.nextDay')).toBe('Sljedeći dan')
  expect(i18n.t('owner.prevMonth')).toBe('Prethodni mjesec')
  expect(i18n.t('owner.nextMonth')).toBe('Sljedeći mjesec')
  expect(i18n.t('owner.soon')).toBe('Uskoro')
  expect(i18n.t('owner.break')).toBe('Pauza')
  expect(i18n.exists('owner.today')).toBe(false)
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

test('worker dot color hashes id into Design 1 palette', () => {
  expect(WORKER_DOT_COLORS).toHaveLength(8)
  expect(workerDotColor('1')).toBe('bg-badge-pink')
})

test('owner month helpers', () => {
  expect(ownerMonthFromYmd('2026-09-17')).toEqual({ year: 2026, month: 9 })
  expect(ownerMonthRange(2026, 2)).toEqual({ from: '2026-02-01', to: '2026-02-28' })
  expect(shiftOwnerMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
  expect(ownerMonthContains(2026, 9, '2026-09-17')).toBe(true)
  expect(ownerMonthContains(2026, 9, '2026-10-01')).toBe(false)
  expect(ownerVisibleMonth({ year: 2026, month: 9 }, '2026-09-28')).toEqual({ year: 2026, month: 9 })
  expect(ownerVisibleMonth({ year: 2026, month: 9 }, '2026-10-15')).toEqual({ year: 2026, month: 10 })
  const days = ownerMonthDays(2026, 9)
  expect(days).toHaveLength(30)
  expect(days[0]).toBe('2026-09-01')
  expect(days[29]).toBe('2026-09-30')
  expect(ownerMonthWeekdayOffset(2026, 9)).toBe(1)
  expect(formatOwnerMonthTitle(2026, 9)).toBe('septembar 2026')
})

test('occupying clock range and request detail mode', () => {
  expect(occupyingClockRange('11:00', 30)).toBe('11:00–11:30')
  expect(occupyingDiaryMeta('11:00', 30, 'Ana')).toBe('–11:30 · Ana')
  expect(occupyingDiaryMeta('11:00', 30)).toBe('–11:30')
  expect(occupyingDiaryMeta('11:00', 30, '')).toBe('–11:30')
  expect(occupyingDiaryMeta('11:00', 30).slice(0, 1)).toBe(occupyingClockRange('11:00', 30).slice(5, 6))
  expect(ownerDetailMode('REQUESTED')).toBe('form')
  expect(ownerDetailMode('CONFIRMED')).toBe('read')
  expect(ownerDetailMode('TIME_PROPOSED')).toBe('read')
  expect(ownerDetailMode('DECLINED')).toBe('bounce')
  expect(ownerDetailMode('CANCELLED')).toBe('bounce')
})

test('occupying dots and selected-day split', () => {
  const noon = {
    status: 'CONFIRMED',
    preferredStartsAt: '2026-08-29T10:00:00.000Z',
    proposedStartsAt: null,
    durationMinutes: 30,
    worker: { id: '1' },
    proposedWorker: null,
    services: [{ name: 'Šišanje' }],
  }
  const later = {
    status: 'CONFIRMED',
    preferredStartsAt: '2026-08-29T13:00:00.000Z',
    proposedStartsAt: null,
    durationMinutes: 30,
    worker: { id: '2' },
    proposedWorker: null,
    services: [{ name: 'Boja' }],
  }
  const requested = {
    status: 'REQUESTED',
    preferredStartsAt: '2026-08-29T10:00:00.000Z',
    proposedStartsAt: null,
    durationMinutes: 30,
    worker: { id: '1' },
    proposedWorker: null,
    services: [{ name: 'Šišanje' }],
  }
  expect(occupyingSarajevoYmd(noon)).toBe('2026-08-29')
  expect(occupyingDotsForDay([requested, noon, later], '2026-08-29')).toEqual([
    { workerId: '1', color: 'bg-badge-pink' },
    { workerId: '2', color: workerDotColor('2') },
  ])
  const now = new Date('2026-08-29T10:30:00.000Z')
  expect(selectedDayOccupying([noon, later], now)).toEqual({ soon: [noon], rest: [later] })
  expect(mixRestWithBreak([noon, later], '13:00', '14:00').map((row) => row.kind)).toEqual([
    'occupying',
    'break',
    'occupying',
  ])
  expect(mixRestWithBreak([noon], null, null).map((row) => row.kind)).toEqual(['occupying'])
})

test('zapisi copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('owner.zapisi')).toBe('Zapisi')
  expect(i18n.t('owner.originAll')).toBe('Svi')
  expect(i18n.t('owner.originGuest')).toBe('Gost')
  expect(i18n.t('owner.date')).toBe('Datum')
  expect(i18n.t('owner.assistant')).toBe('Asistent')
  expect(i18n.t('owner.phone.button')).toBe('Telefon')
  expect(i18n.t('bookings.status.REQUESTED')).toBe('Na čekanju')
  expect(i18n.t('bookings.status.CONFIRMED')).toBe('Potvrđeno')
  expect(i18n.t('bookings.status.TIME_PROPOSED')).toBe('Predloženo vrijeme')
  expect(i18n.t('bookings.status.DECLINED')).toBe('Odbijeno')
  expect(i18n.t('bookings.status.CANCELLED')).toBe('Otkazano')
})

test('owner settings copy is Bosnian', async () => {
  const { default: i18n } = await import('../i18n')
  expect(i18n.t('owner.settings')).toBe('Postavke')
  expect(i18n.t('owner.passwordCurrent')).toBe('Trenutna lozinka')
  expect(i18n.t('owner.passwordNew')).toBe('Nova lozinka')
  expect(i18n.t('owner.passwordConfirm')).toBe('Ponovi lozinku')
  expect(i18n.t('owner.passwordMismatch')).toBe('Lozinke se ne poklapaju.')
  expect(i18n.t('owner.passwordChanged')).toBe('Lozinka je promijenjena.')
  expect(i18n.t('owner.passwordError.INVALID_CURRENT_PASSWORD')).toBe('Pogrešna trenutna lozinka.')
  expect(i18n.t('auth.gate.WEAK_PASSWORD')).toBe('Lozinka mora imati najmanje 8 karaktera.')
  expect(i18n.t('owner.save')).toBe('Spremi')
})
