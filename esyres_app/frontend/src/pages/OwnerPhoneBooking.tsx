import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { TopNav } from '../components/TopNav'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import {
  CREATE_PHONE_BOOKING_MUTATION,
  OCCUPYING_BOOKINGS_QUERY,
  OWNER_SALON_QUERY,
  type OccupyingBookingsData,
  type OwnerSalonData,
} from '../graphql/pending'
import { graphqlErrorCode } from '../lib/booking'
import { CREATE_SALON_PATH } from '../lib/createSalon'
import { sarajevoToday } from '../lib/format'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import {
  hoursForDate,
  ownerDateFromSearch,
  ownerQueuePath,
  ownerSalonFromSearch,
  ownerSearchParams,
  phoneErrorKey,
  phoneFreeWorkerIds,
  phoneRangeOpen,
} from '../lib/owner'
import { useOwnerPush } from '../lib/push'

function roundUp15(minutes: number): number {
  return Math.floor((minutes + 14) / 15) * 15
}

export function OwnerPhoneBooking() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const returnDate = ownerDateFromSearch(params.get('date'))
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const navMe = loading ? null : (data?.me ?? null)
  const salons = data?.me?.salons ?? []
  const firstOwnedId = salons[0]?.id ?? ''
  const salonId = ownerSalonFromSearch(params.get('salon'), salons)
  const salon = salons.find((row) => row.id === salonId) ?? null
  const ownerReady = salon !== null && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const { data: countData } = useQuery<InFlightIntakeCountData>(IN_FLIGHT_INTAKE_COUNT_QUERY, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const badge = chatBadgeCount(countData?.inFlightIntakeCount ?? 0)
  const { data: board } = useQuery<OwnerSalonData>(OWNER_SALON_QUERY, {
    variables: { id: salon?.id ?? '' },
    skip: !ownerReady,
  })
  const [step, setStep] = useState(0)
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [workerId, setWorkerId] = useState('')
  const [callerName, setCallerName] = useState('')
  const [callerPhone, setCallerPhone] = useState('')
  const [callerNote, setCallerNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createPhone, { loading: saving }] = useMutation(CREATE_PHONE_BOOKING_MUTATION)
  const categories = board?.salon?.serviceCategories ?? []
  const catalog = categories.flatMap((category) => category.services)
  const selected = catalog.filter((service) => serviceIds.includes(service.id))
  const duration = roundUp15(selected.reduce((sum, service) => sum + service.durationMinutes, 0))
  const clock = time.slice(0, 5)
  const open = phoneRangeOpen(hoursForDate(board?.salon?.hours ?? [], day), clock, duration)
  const { data: occupying } = useQuery<OccupyingBookingsData>(OCCUPYING_BOOKINGS_QUERY, {
    variables: { salonId: salon?.id ?? '', date: day },
    skip: !ownerReady || day === '',
  })
  const freeIds = phoneFreeWorkerIds(
    board?.salon?.workers ?? [],
    occupying?.occupyingBookings ?? [],
    clock,
    duration,
    open && duration > 0,
  )
  const freeWorkers = (board?.salon?.workers ?? []).filter((worker) => freeIds.includes(worker.id))

  useEffect(() => {
    if (workerId !== '' && !freeIds.includes(workerId)) {
      setWorkerId('')
    }
  }, [workerId, freeIds])

  function resetDraft() {
    setStep(0)
    setServiceIds([])
    setDay('')
    setTime('')
    setWorkerId('')
    setCallerName('')
    setCallerPhone('')
    setCallerNote('')
    setError(null)
  }

  function onSalon(id: string) {
    resetDraft()
    setParams(ownerSearchParams(returnDate, sarajevoToday(), id, firstOwnedId))
  }

  function toggleService(id: string) {
    setServiceIds((current) => (current.includes(id) ? current.filter((row) => row !== id) : [...current, id]))
  }

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (saving || salon === null) {
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
            salonId: salon.id,
            serviceIds,
            preferredDate: day,
            preferredTime: clock,
            workerId,
            callerName: name,
            callerPhone: callerPhone.trim(),
            callerNote: callerNote.trim(),
          },
        },
      })
      const saved = result.data?.createPhoneBooking?.preferredDate
      if (typeof saved === 'string') {
        navigate(ownerQueuePath(saved, sarajevoToday(), salon.id, firstOwnedId))
      }
    } catch (err) {
      setError(t(`owner.phone.error.${phoneErrorKey(graphqlErrorCode(err))}`))
    }
  }

  if (loading) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="px-5 py-8 text-body">
          <p>{t('salon.loading')}</p>
        </main>
      </>
    )
  }

  if (data?.me == null) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="mx-auto max-w-md px-5 py-8">
          <h1 className={PLACE_HEADING_CLASS}>{t('auth.placePanel')}</h1>
          <div className="mt-8">
            <AuthShell allowRegister={false} onAuthenticated={() => refetch()} />
          </div>
        </main>
      </>
    )
  }

  if (!data.me.emailVerified) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="mx-auto max-w-md px-5 py-8">
          <h1 className={PLACE_HEADING_CLASS}>{t('auth.placePanel')}</h1>
          <div className="mt-8">
            <EmailVerifyPanel />
          </div>
        </main>
      </>
    )
  }

  if (salon === null) {
    return (
      <>
        <TopNav me={navMe} />
        <main className="mx-auto max-w-md px-5 py-8">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.title')}</h1>
          <p className="mt-8 text-sm text-body">{t('owner.notOwner')}</p>
          <Link to={CREATE_SALON_PATH} className="mt-4 inline-block text-sm font-semibold text-ink">
            {t('owner.createSalon')}
          </Link>
        </main>
      </>
    )
  }

  const back = ownerQueuePath(returnDate, sarajevoToday(), salon.id, firstOwnedId)

  return (
    <>
      <TopNav me={navMe} />
      <div className="min-h-svh md:flex">
        <aside className="hidden border-r border-hairline bg-canvas px-5 py-8 text-ink md:flex md:w-56 md:shrink-0 md:flex-col">
          {salons.length > 1 ? (
            <label className="block text-sm">
              {t('owner.salon')}
              <select
                value={salon.id}
                onChange={(e) => onSalon(e.target.value)}
                className="mt-1 w-full rounded-md border border-hairline bg-canvas px-2 py-1.5 text-sm text-ink"
              >
                {salons.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-sm font-semibold">{salon.name}</p>
          )}
          <OwnerNav salonId={salon.id} firstOwnedId={firstOwnedId} date={returnDate} badge={badge} active="queue" />
        </aside>
        <main className="flex-1 px-5 py-8">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink md:hidden">{t('owner.phone.title')}</h1>
          {salons.length > 1 ? (
            <label className="mt-1 block max-w-xs text-sm text-body md:hidden">
              {t('owner.salon')}
              <select
                value={salon.id}
                onChange={(e) => onSalon(e.target.value)}
                className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
              >
                {salons.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="mt-1 text-sm text-body md:hidden">{salon.name}</p>
          )}
          <div className="md:hidden">
            <OwnerNav salonId={salon.id} firstOwnedId={firstOwnedId} date={returnDate} badge={badge} active="queue" />
          </div>
          <p className="mt-6">
            <Link to={back} className="text-sm font-medium text-ink underline">
              {t('owner.back')}
            </Link>
          </p>
          <section className="mt-4 rounded-lg border border-hairline bg-canvas p-4">
            <h1 className="hidden font-display text-[28px] font-semibold tracking-tight text-ink md:block">{t('owner.phone.title')}</h1>
            {step === 0 ? (
              <div className="mt-4 space-y-4">
                <h2 className="text-sm font-semibold text-ink">{t('owner.phone.services')}</h2>
                {categories.map((category) => (
                  <div key={category.id}>
                    <p className="text-sm font-semibold text-ink">{category.name}</p>
                    {category.services.map((service) => (
                      <label key={service.id} className="mt-1 flex items-center gap-2 text-sm text-body">
                        <input
                          type="checkbox"
                          checked={serviceIds.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                        />
                        {service.name}
                      </label>
                    ))}
                  </div>
                ))}
                <button
                  type="button"
                  disabled={serviceIds.length === 0}
                  onClick={() => setStep(1)}
                  className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                >
                  {t('owner.phone.next')}
                </button>
              </div>
            ) : null}
            {step === 1 ? (
              <div className="mt-4 space-y-4">
                <h2 className="text-sm font-semibold text-ink">{t('owner.phone.when')}</h2>
                <label className="block text-sm text-body">
                  {t('salon.date')}
                  <input
                    type="date"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                  />
                </label>
                <label className="block text-sm text-body">
                  {t('salon.time')}
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                  />
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep((n) => n - 1)} className="text-sm font-medium text-ink">
                    {t('owner.back')}
                  </button>
                  <button
                    type="button"
                    disabled={day === '' || time === ''}
                    onClick={() => setStep(2)}
                    className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                  >
                    {t('owner.phone.next')}
                  </button>
                </div>
              </div>
            ) : null}
            {step === 2 ? (
              <div className="mt-4 space-y-4">
                <h2 className="text-sm font-semibold text-ink">{t('owner.phone.worker')}</h2>
                {freeWorkers.length === 0 ? (
                  <p className="text-sm text-body">{t('owner.phone.noWorker')}</p>
                ) : (
                  <label className="block text-sm text-body">
                    {t('salon.worker')}
                    <select
                      value={workerId}
                      onChange={(e) => setWorkerId(e.target.value)}
                      className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                    >
                      <option value="">{t('owner.pickWorker')}</option>
                      {freeWorkers.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep((n) => n - 1)} className="text-sm font-medium text-ink">
                    {t('owner.back')}
                  </button>
                  {freeWorkers.length === 0 ? null : (
                    <button
                      type="button"
                      disabled={workerId === ''}
                      onClick={() => setStep(3)}
                      className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                    >
                      {t('owner.phone.next')}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
            {step === 3 ? (
              <form className="mt-4 space-y-4" onSubmit={(e) => void onSave(e)}>
                <h2 className="text-sm font-semibold text-ink">{t('owner.phone.caller')}</h2>
                <label className="block text-sm text-body">
                  {t('auth.name')}
                  <input
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                  />
                </label>
                <label className="block text-sm text-body">
                  {t('auth.phone')}
                  <input
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                  />
                </label>
                <label className="block text-sm text-body">
                  {t('owner.phone.note')}
                  <textarea
                    value={callerNote}
                    onChange={(e) => setCallerNote(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-ink"
                  />
                </label>
                {error ? <p className="text-sm text-busy-busy">{error}</p> : null}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep((n) => n - 1)} className="text-sm font-medium text-ink">
                    {t('owner.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas disabled:opacity-40"
                  >
                    {t('owner.save')}
                  </button>
                </div>
              </form>
            ) : null}
          </section>
        </main>
      </div>
    </>
  )
}
