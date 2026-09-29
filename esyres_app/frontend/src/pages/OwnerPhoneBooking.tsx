import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useSearchParams } from 'react-router-dom'
import {
  CREATE_PHONE_BOOKING_MUTATION,
  OCCUPYING_BOOKINGS_QUERY,
  OCCUPYING_BOOKINGS_RANGE_QUERY,
  type OccupyingBooking,
  type OccupyingBookingsData,
  type OccupyingBookingsRangeData,
} from '../graphql/pending'
import { graphqlErrorCode } from '../lib/booking'
import { sarajevoToday } from '../lib/format'
import {
  hoursForDate,
  ownerDateFromSearch,
  ownerQueuePath,
  phoneAfterServiceChange,
  phoneDayChip,
  phoneErrorKey,
  phoneFreeWorkerIds,
  phoneLegalStarts,
  phoneRangeOpen,
  phoneSkipDate,
  phoneWorkerSelection,
  shiftOwnerDate,
  type PanelHours,
} from '../lib/owner'
import { SALON_PICKER_DIALOG_CLASS } from '../lib/salonSend'
import { dialogCancelShouldClose } from '../lib/salonDialog'

const NEXT_CLASS = 'rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40'

function roundUp15(minutes: number): number {
  return Math.floor((minutes + 14) / 15) * 15
}

type Chip = 'today' | 'tomorrow' | 'other'

export function PhoneBookingDialog({
  open,
  salonId,
  hours,
  workers,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean
  salonId: string
  hours: PanelHours[] | null
  workers: { id: string; name: string }[]
  categories: { id: string; name: string; services: { id: string; name: string; durationMinutes: number }[] }[]
  onClose: () => void
  onSaved: (date: string) => void
}) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const keepOpen = useRef(false)
  const salonSeen = useRef(salonId)
  const wasOpen = useRef(false)
  const [step, setStep] = useState(0)
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [chip, setChip] = useState<Chip>('today')
  const [otherDate, setOtherDate] = useState('')
  const [time, setTime] = useState('')
  const [workerId, setWorkerId] = useState('')
  const [callerName, setCallerName] = useState('')
  const [callerPhone, setCallerPhone] = useState('')
  const [callerNote, setCallerNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [skipped, setSkipped] = useState(false)
  const [createPhone, { loading: saving }] = useMutation(CREATE_PHONE_BOOKING_MUTATION)
  const today = sarajevoToday()
  const windowTo = shiftOwnerDate(today, 6)
  const resolved = chip === 'today' ? today : chip === 'tomorrow' ? shiftOwnerDate(today, 1) : otherDate
  const catalog = categories.flatMap((category) => category.services)
  const duration = roundUp15(
    catalog.filter((service) => serviceIds.includes(service.id)).reduce((sum, service) => sum + service.durationMinutes, 0),
  )
  const { data: windowData, loading: windowLoading, error: windowError } = useQuery<OccupyingBookingsRangeData>(
    OCCUPYING_BOOKINGS_RANGE_QUERY,
    {
      variables: { salonId, from: today, to: windowTo },
      skip: !open || salonId === '',
    },
  )
  const windowRows = windowData?.occupyingBookingsRange
  const windowFailed = windowError != null && windowRows === undefined
  const outside = resolved !== '' && (resolved < today || resolved > windowTo)
  const { data: dayData, loading: dayLoading } = useQuery<OccupyingBookingsData>(OCCUPYING_BOOKINGS_QUERY, {
    variables: { salonId, date: resolved },
    skip: !open || !outside,
  })

  function rowsFor(date: string): OccupyingBooking[] | null {
    if (date === '') {
      return []
    }
    if (date >= today && date <= windowTo) {
      if (windowRows === undefined) {
        return null
      }
      return windowRows.filter((row) => row.preferredDate === date)
    }
    if (dayLoading || dayData === undefined) {
      return null
    }
    return dayData.occupyingBookings
  }

  const rows = resolved === '' ? [] : rowsFor(resolved)
  const dayHours = hours === null || resolved === '' ? undefined : hoursForDate(hours, resolved)
  const starts =
    rows === null || hours === null || resolved === ''
      ? []
      : phoneLegalStarts(dayHours, workers, rows, duration)
  const rangeOpen = phoneRangeOpen(dayHours, time, duration) && duration > 0
  const freeIds =
    time === '' || rows === null ? [] : phoneFreeWorkerIds(workers, rows, time, duration, rangeOpen)
  const freeWorkers = workers.filter((worker) => freeIds.includes(worker.id))
  const waitingSkip = !skipped && !windowFailed && (hours === null || windowRows === undefined || windowLoading)
  const dayClosed = resolved !== '' && rows !== null && (dayHours === undefined || dayHours.closed)
  const dayEmpty = resolved !== '' && rows !== null && !dayClosed && starts.length === 0

  useEffect(() => {
    if (salonSeen.current === salonId) {
      return
    }
    salonSeen.current = salonId
    onClose()
  }, [salonId, onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog == null) {
      return
    }
    if (open) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      wasOpen.current = false
      return
    }
    if (wasOpen.current) {
      return
    }
    wasOpen.current = true
    setStep(0)
    setServiceIds([])
    setChip('today')
    setOtherDate('')
    setTime('')
    setWorkerId('')
    setCallerName('')
    setCallerPhone('')
    setCallerNote('')
    setError(null)
    setSkipped(false)
  }, [open])

  useEffect(() => {
    if (!open || step !== 1 || skipped || hours === null || windowRows === undefined) {
      return
    }
    const picked = phoneSkipDate(today, (day) => {
      return phoneLegalStarts(hoursForDate(hours, day), workers, windowRows.filter((row) => row.preferredDate === day), duration).length > 0
    })
    const nextChip = phoneDayChip(picked, today)
    setChip(nextChip)
    setOtherDate(nextChip === 'other' ? picked : '')
    setSkipped(true)
  }, [open, step, skipped, hours, windowRows, duration, today, workers])

  useEffect(() => {
    if (time === '' || rows === null) {
      return
    }
    setWorkerId((current) => phoneWorkerSelection(freeIds, current))
  }, [time, rows, freeIds])

  function clearSlot() {
    setTime('')
    setWorkerId('')
  }

  function onChip(next: Chip) {
    if (next === 'other' && otherDate === '') {
      setChip('other')
      clearSlot()
      return
    }
    const nextDay = next === 'today' ? today : next === 'tomorrow' ? shiftOwnerDate(today, 1) : otherDate
    if (nextDay !== resolved) {
      clearSlot()
    }
    setChip(next)
  }

  function onOtherDate(value: string) {
    if (value === '') {
      setOtherDate('')
      clearSlot()
      return
    }
    const nextChip = phoneDayChip(value, today)
    const nextDay = nextChip === 'today' ? today : nextChip === 'tomorrow' ? shiftOwnerDate(today, 1) : value
    if (nextDay !== resolved) {
      clearSlot()
    }
    setChip(nextChip)
    setOtherDate(nextChip === 'other' ? value : '')
  }

  function toggleService(id: string) {
    const nextIds = serviceIds.includes(id) ? serviceIds.filter((row) => row !== id) : [...serviceIds, id]
    setServiceIds(nextIds)
    if (resolved === '' || time === '' || rows === null || hours === null) {
      return
    }
    const nextDuration = roundUp15(
      catalog.filter((service) => nextIds.includes(service.id)).reduce((sum, service) => sum + service.durationMinutes, 0),
    )
    const legal = phoneLegalStarts(hoursForDate(hours, resolved), workers, rows, nextDuration)
    const kept = phoneAfterServiceChange(time, workerId, legal)
    setTime(kept.time)
    setWorkerId(kept.workerId)
  }

  async function onSave(event: FormEvent) {
    event.preventDefault()
    if (saving || time === '') {
      return
    }
    const name = callerName.trim()
    if (name === '') {
      setError(t('owner.phone.error.INVALID_CALLER_NAME'))
      return
    }
    setError(null)
    try {
      const result = await createPhone({
        variables: {
          input: {
            salonId,
            serviceIds,
            preferredDate: resolved,
            preferredTime: time,
            workerId,
            callerName: name,
            callerPhone: callerPhone.trim(),
            callerNote: callerNote.trim(),
          },
        },
      })
      const saved = result.data?.createPhoneBooking?.preferredDate
      if (typeof saved === 'string') {
        onSaved(saved)
      }
    } catch (err) {
      setError(t(`owner.phone.error.${phoneErrorKey(graphqlErrorCode(err))}`))
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={SALON_PICKER_DIALOG_CLASS}
      onCancel={(event) => {
        if (
          !dialogCancelShouldClose(
            document.activeElement instanceof HTMLInputElement ? document.activeElement.type : null,
          )
        ) {
          event.preventDefault()
          keepOpen.current = true
        } else {
          keepOpen.current = false
        }
      }}
      onClose={() => {
        if (keepOpen.current) {
          keepOpen.current = false
          queueMicrotask(() => dialogRef.current?.showModal())
          return
        }
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose()
        }
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.phone.title')}</h2>
        <button type="button" className="text-sm text-body" onClick={onClose}>
          {t('salon.close')}
        </button>
      </div>
      {step === 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-ink">{t('owner.phone.services')}</h3>
          {categories.map((category) => (
            <div key={category.id}>
              <p className="text-sm font-semibold text-ink">{category.name}</p>
              {category.services.map((service) => (
                <label key={service.id} className="mt-1 flex items-center gap-2 text-sm text-body">
                  <input type="checkbox" checked={serviceIds.includes(service.id)} onChange={() => toggleService(service.id)} />
                  {service.name}
                </label>
              ))}
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="text-sm font-medium text-ink">
              {t('owner.back')}
            </button>
            <button type="button" disabled={serviceIds.length === 0} onClick={() => setStep(1)} className={NEXT_CLASS}>
              {t('owner.phone.next')}
            </button>
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-ink">{t('owner.phone.when')}</h3>
          {waitingSkip ? (
            <p className="text-sm text-body">{t('salon.loading')}</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {(['today', 'tomorrow', 'other'] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={chip === id}
                    onClick={() => onChip(id)}
                    className={
                      chip === id
                        ? 'rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas'
                        : 'rounded-full border border-hairline px-3 py-1.5 text-sm text-ink'
                    }
                  >
                    {t(id === 'today' ? 'owner.phone.today' : id === 'tomorrow' ? 'owner.phone.tomorrow' : 'owner.phone.otherDay')}
                  </button>
                ))}
              </div>
              {chip === 'other' ? (
                <label className="block text-sm text-body">
                  {t('salon.date')}
                  <input
                    type="date"
                    value={otherDate}
                    onChange={(event) => onOtherDate(event.target.value)}
                    className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                  />
                </label>
              ) : null}
              {resolved !== '' && rows === null && !windowFailed ? (
                <p className="text-sm text-body">{t('salon.loading')}</p>
              ) : null}
              {dayClosed ? <p className="text-sm text-body">{t('owner.phone.error.SALON_CLOSED')}</p> : null}
              {dayEmpty ? <p className="text-sm text-body">{t('owner.phone.noStart')}</p> : null}
              {resolved !== '' && rows !== null && !dayClosed && starts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {starts.map((start) => (
                    <button
                      key={start}
                      type="button"
                      aria-pressed={time === start}
                      onClick={() => {
                        if (start !== time) {
                          setWorkerId('')
                        }
                        setTime(start)
                      }}
                      className={
                        time === start
                          ? 'rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas'
                          : 'rounded-full border border-hairline px-3 py-1.5 text-sm text-ink'
                      }
                    >
                      {start}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(0)} className="text-sm font-medium text-ink">
              {t('owner.back')}
            </button>
            <button type="button" disabled={time === ''} onClick={() => setStep(2)} className={NEXT_CLASS}>
              {t('owner.phone.next')}
            </button>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-ink">{t('owner.phone.worker')}</h3>
          {freeWorkers.length === 0 ? (
            <p className="text-sm text-body">{t('owner.phone.noWorker')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {freeWorkers.map((worker) => (
                <button
                  key={worker.id}
                  type="button"
                  aria-pressed={workerId === worker.id}
                  onClick={() => setWorkerId(worker.id)}
                  className={
                    workerId === worker.id
                      ? 'rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas'
                      : 'rounded-full border border-hairline px-3 py-1.5 text-sm text-ink'
                  }
                >
                  {worker.name}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-ink">
              {t('owner.back')}
            </button>
            {freeWorkers.length === 0 ? null : (
              <button type="button" disabled={workerId === ''} onClick={() => setStep(3)} className={NEXT_CLASS}>
                {t('owner.phone.next')}
              </button>
            )}
          </div>
        </div>
      ) : null}
      {step === 3 ? (
        <form className="space-y-4" onSubmit={(event) => void onSave(event)}>
          <h3 className="text-sm font-semibold text-ink">{t('owner.phone.caller')}</h3>
          <label className="block text-sm text-body">
            {t('auth.name')}
            <input
              value={callerName}
              onChange={(event) => setCallerName(event.target.value)}
              className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
            />
          </label>
          <label className="block text-sm text-body">
            {t('auth.phone')}
            <input
              value={callerPhone}
              onChange={(event) => setCallerPhone(event.target.value)}
              className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
            />
          </label>
          <label className="block text-sm text-body">
            {t('owner.phone.note')}
            <textarea
              value={callerNote}
              onChange={(event) => setCallerNote(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
            />
          </label>
          {error ? <p className="text-sm text-busy-busy">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-ink">
              {t('owner.back')}
            </button>
            <button type="submit" disabled={saving} className={NEXT_CLASS}>
              {t('owner.save')}
            </button>
          </div>
        </form>
      ) : null}
    </dialog>
  )
}

export function OwnerPhoneBooking() {
  const [params] = useSearchParams()
  const today = sarajevoToday()
  const date = ownerDateFromSearch(params.get('date'), today)
  const salon = params.get('salon')

  return <Navigate to={ownerQueuePath(date, today, salon, salon === null ? null : '')} replace />
}
