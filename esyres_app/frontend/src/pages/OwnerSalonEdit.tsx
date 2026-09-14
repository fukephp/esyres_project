import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { TopNav } from '../components/TopNav'
import {
  CREATE_SALON_SERVICE_MUTATION,
  CREATE_SALON_WORKER_MUTATION,
  ME_QUERY,
  UPDATE_SALON_HOURS_MUTATION,
  UPDATE_SALON_MUTATION,
  UPDATE_SALON_SERVICE_MUTATION,
  UPDATE_SALON_WORKER_MUTATION,
  type MeData,
} from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import { CREATE_SALON_PATH } from '../lib/createSalon'
import { graphqlErrorCode } from '../lib/booking'
import { DISCOVERY_CATEGORIES } from '../lib/discovery'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import {
  feningaToKm,
  kmToFeninga,
  SALON_WEEKDAYS,
  toSalonHoursInput,
  type PanelHours,
  type SalonHoursDayForm,
} from '../lib/owner'
import { useOwnerPush } from '../lib/push'

const FIELD =
  'mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink'
const SAVE_BTN =
  'h-10 w-fit rounded-md bg-ink px-5 text-sm font-semibold text-canvas disabled:opacity-40 active:bg-[#242424]'
const CHIP_IDLE = 'text-body'
const CHIP_ON = 'font-semibold text-ink'
const PANEL = 'mt-8 space-y-4 border border-hairline p-5'

type SalonEditSection = 'info' | 'hours' | 'services' | 'workers'

type OwnerSalonService = NonNullable<MeData['me']>['salons'][number]['services'][number]
type OwnerSalonWorker = NonNullable<MeData['me']>['salons'][number]['workers'][number]

function emptyWeek(): SalonHoursDayForm[] {
  return SALON_WEEKDAYS.map((weekday) => ({
    weekday,
    closed: true,
    opensAt: '',
    closesAt: '',
    breakOn: false,
    breakStartsAt: '',
    breakEndsAt: '',
  }))
}

function daysFromHours(hours: PanelHours[]): SalonHoursDayForm[] {
  return SALON_WEEKDAYS.map((weekday) => {
    const row = hours.find((day) => day.weekday === weekday)
    const breakOn = row?.breakStartsAt != null && row.breakEndsAt != null

    return {
      weekday,
      closed: row === undefined || row.closed,
      opensAt: row?.opensAt ?? '',
      closesAt: row?.closesAt ?? '',
      breakOn,
      breakStartsAt: row?.breakStartsAt ?? '',
      breakEndsAt: row?.breakEndsAt ?? '',
    }
  })
}

function serviceFail(code: string, t: (key: string) => string): string {
  if (code === 'INVALID_NAME') {
    return t('owner.INVALID_SERVICE_NAME')
  }
  if (code === 'INVALID_DURATION') {
    return t('owner.INVALID_DURATION')
  }
  if (code === 'INVALID_PRICE') {
    return t('owner.INVALID_PRICE')
  }
  if (code === 'DUPLICATE_SERVICE_NAME') {
    return t('owner.DUPLICATE_SERVICE_NAME')
  }
  if (code === 'FORBIDDEN') {
    return t('owner.FORBIDDEN')
  }

  return t('salon.gate.fallback')
}

function workerFail(code: string, t: (key: string) => string): string {
  if (code === 'INVALID_NAME') {
    return t('owner.INVALID_WORKER_NAME')
  }
  if (code === 'DUPLICATE_WORKER_NAME') {
    return t('owner.DUPLICATE_WORKER_NAME')
  }
  if (code === 'FORBIDDEN') {
    return t('owner.FORBIDDEN')
  }

  return t('salon.gate.fallback')
}

function SalonWorkerForm({
  salonId,
  worker,
  onSaved,
}: {
  salonId: string
  worker?: OwnerSalonWorker
  onSaved: () => Promise<unknown>
}) {
  const { t } = useTranslation()
  const [createSalonWorker, { loading: creating }] = useMutation(CREATE_SALON_WORKER_MUTATION)
  const [updateSalonWorker, { loading: updating }] = useMutation(UPDATE_SALON_WORKER_MUTATION)
  const saving = creating || updating
  const [name, setName] = useState(worker?.name ?? '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (worker === undefined) {
      return
    }
    setName(worker.name)
  }, [worker])

  async function onSaveWorker(e: FormEvent) {
    e.preventDefault()
    if (saving) {
      return
    }
    setError(null)
    try {
      if (worker === undefined) {
        await createSalonWorker({ variables: { salonId, input: { name: name.trim() } } })
        setName('')
      } else {
        await updateSalonWorker({
          variables: { id: worker.id, input: { name: name.trim() } },
        })
      }
      await onSaved()
    } catch (err) {
      setError(workerFail(graphqlErrorCode(err) ?? '', t))
    }
  }

  return (
    <form className="space-y-3" onSubmit={(e) => void onSaveWorker(e)}>
      <label className="block text-sm text-body">
        {t('owner.workerName')}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD}
        />
      </label>
      {error ? <p className="text-sm text-busy-busy">{error}</p> : null}
      <button type="submit" disabled={saving} className={SAVE_BTN}>
        {worker === undefined ? t('owner.addWorker') : t('owner.save')}
      </button>
    </form>
  )
}

function SalonServiceForm({
  salonId,
  service,
  onSaved,
}: {
  salonId: string
  service?: OwnerSalonService
  onSaved: () => Promise<unknown>
}) {
  const { t } = useTranslation()
  const [createSalonService, { loading: creating }] = useMutation(CREATE_SALON_SERVICE_MUTATION)
  const [updateSalonService, { loading: updating }] = useMutation(UPDATE_SALON_SERVICE_MUTATION)
  const saving = creating || updating
  const [name, setName] = useState(service?.name ?? '')
  const [category, setCategory] = useState(service?.category ?? 'HAIR')
  const [duration, setDuration] = useState(
    service === undefined ? '' : String(service.durationMinutes),
  )
  const [price, setPrice] = useState(service === undefined ? '' : feningaToKm(service.priceFeninga))
  const [error, setError] = useState<string | null>(null)
  const radioName = `service-category-${service?.id ?? 'new'}`

  useEffect(() => {
    if (service === undefined) {
      return
    }
    setName(service.name)
    setCategory(service.category)
    setDuration(String(service.durationMinutes))
    setPrice(feningaToKm(service.priceFeninga))
  }, [service])

  async function onSaveService(e: FormEvent) {
    e.preventDefault()
    if (saving) {
      return
    }
    const priceFeninga = kmToFeninga(price)
    if (priceFeninga === null) {
      setError(t('owner.INVALID_PRICE'))
      return
    }
    setError(null)
    try {
      if (service === undefined) {
        const input: {
          name: string
          category: string
          priceFeninga: number
          durationMinutes?: number
        } = { name: name.trim(), category, priceFeninga }
        if (duration.trim() !== '') {
          input.durationMinutes = Number.parseInt(duration, 10)
        }
        await createSalonService({ variables: { salonId, input } })
        setName('')
        setCategory('HAIR')
        setDuration('')
        setPrice('')
      } else {
        await updateSalonService({
          variables: {
            id: service.id,
            input: {
              name: name.trim(),
              category,
              durationMinutes: Number.parseInt(duration, 10) || 0,
              priceFeninga,
            },
          },
        })
      }
      await onSaved()
    } catch (err) {
      setError(serviceFail(graphqlErrorCode(err) ?? '', t))
    }
  }

  return (
    <form className="space-y-3" onSubmit={(e) => void onSaveService(e)}>
      <label className="block text-sm text-body">
        {t('owner.serviceName')}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD}
        />
      </label>
      <div className="flex flex-wrap gap-3 text-sm text-body">
        {DISCOVERY_CATEGORIES.map((cat) => (
          <label key={cat} className="flex items-center gap-2">
            <input
              type="radio"
              name={radioName}
              checked={category === cat}
              onChange={() => setCategory(cat)}
            />
            {t(`category.${cat}`)}
          </label>
        ))}
      </div>
      <label className="block text-sm text-body">
        {t('owner.duration')}
        <input
          type="number"
          step={15}
          min={15}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={FIELD}
        />
      </label>
      <label className="block text-sm text-body">
        {t('owner.price')}
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={FIELD} />
      </label>
      {error ? <p className="text-sm text-busy-busy">{error}</p> : null}
      <button type="submit" disabled={saving} className={SAVE_BTN}>
        {service === undefined ? t('owner.addService') : t('owner.save')}
      </button>
    </form>
  )
}

export function OwnerSalonEdit() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const [updateSalon, { loading: savingSalon }] = useMutation(UPDATE_SALON_MUTATION)
  const [updateSalonHours, { loading: savingHours }] = useMutation(UPDATE_SALON_HOURS_MUTATION)
  const [section, setSection] = useState<SalonEditSection>('info')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [days, setDays] = useState<SalonHoursDayForm[]>(emptyWeek)
  const [notice, setNotice] = useState('24')
  const [infoError, setInfoError] = useState<string | null>(null)
  const [hoursError, setHoursError] = useState<string | null>(null)
  const navMe = loading ? null : (data?.me ?? null)
  const salons = data?.me?.salons ?? []
  const firstOwnedId = salons[0]?.id ?? ''
  const salon = salons.find((row) => row.id === id)
  const ownerReady = firstOwnedId !== '' && data?.me?.emailVerified === true
  const navSalonId = salon?.id ?? firstOwnedId
  useOwnerPush(ownerReady)
  const { data: countData } = useQuery<InFlightIntakeCountData>(IN_FLIGHT_INTAKE_COUNT_QUERY, {
    variables: { salonId: navSalonId },
    skip: !ownerReady || navSalonId === '',
    fetchPolicy: 'network-only',
  })
  const badge = chatBadgeCount(countData?.inFlightIntakeCount ?? 0)

  useEffect(() => {
    if (salon === undefined) {
      return
    }
    setName(salon.name)
    setAddress(salon.address ?? '')
    setDays(daysFromHours(salon.hours))
    setNotice(String(salon.cancellationNoticeHours ?? 24))
  }, [salon])

  function patchDay(weekday: string, patch: Partial<SalonHoursDayForm>): void {
    setDays((rows) => rows.map((row) => (row.weekday === weekday ? { ...row, ...patch } : row)))
  }

  async function onSubmitInfo(e: FormEvent) {
    e.preventDefault()
    if (savingSalon || salon === undefined) {
      return
    }
    setInfoError(null)
    try {
      await updateSalon({
        variables: { salonId: salon.id, input: { name, address } },
      })
      await refetch()
    } catch (err) {
      const code = graphqlErrorCode(err)
      if (code === 'INVALID_NAME') {
        setInfoError(t('owner.INVALID_NAME'))
      } else if (code === 'INVALID_ADDRESS') {
        setInfoError(t('owner.INVALID_ADDRESS'))
      } else {
        setInfoError(t('salon.gate.fallback'))
      }
    }
  }

  async function onSubmitHours(e: FormEvent) {
    e.preventDefault()
    if (savingHours || salon === undefined) {
      return
    }
    setHoursError(null)
    const cancellationNoticeHours = Number.parseInt(notice, 10)
    try {
      await updateSalonHours({
        variables: {
          salonId: salon.id,
          input: {
            hours: toSalonHoursInput(days),
            cancellationNoticeHours: Number.isNaN(cancellationNoticeHours)
              ? 24
              : cancellationNoticeHours,
          },
        },
      })
      await refetch()
    } catch (err) {
      const code = graphqlErrorCode(err)
      if (code === 'INVALID_HOURS') {
        setHoursError(t('owner.INVALID_HOURS'))
      } else {
        setHoursError(t('salon.gate.fallback'))
      }
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

  if (firstOwnedId === '') {
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

  return (
    <>
      <TopNav me={navMe} />
      <div className="min-h-svh md:flex">
        <aside className="hidden border-r border-hairline bg-canvas px-5 py-8 text-ink md:flex md:w-56 md:shrink-0 md:flex-col">
          <OwnerNav salonId={navSalonId} firstOwnedId={firstOwnedId} badge={badge} active="salons" />
        </aside>
        <main className="flex-1 px-5 py-8">
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
            {salon?.name ?? t('owner.FORBIDDEN')}
          </h1>
          <div className="md:hidden">
            <OwnerNav salonId={navSalonId} firstOwnedId={firstOwnedId} badge={badge} active="salons" />
          </div>
          {salon === undefined ? (
            <p className="mt-8 text-sm text-body">{t('owner.FORBIDDEN')}</p>
          ) : (
            <>
              <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <button
                  type="button"
                  className={section === 'info' ? CHIP_ON : CHIP_IDLE}
                  onClick={() => setSection('info')}
                >
                  {t('owner.info')}
                </button>
                <button
                  type="button"
                  className={section === 'hours' ? CHIP_ON : CHIP_IDLE}
                  onClick={() => setSection('hours')}
                >
                  {t('salon.hours')}
                </button>
                <button
                  type="button"
                  className={section === 'services' ? CHIP_ON : CHIP_IDLE}
                  onClick={() => setSection('services')}
                >
                  {t('salon.services')}
                </button>
                <button
                  type="button"
                  className={section === 'workers' ? CHIP_ON : CHIP_IDLE}
                  onClick={() => setSection('workers')}
                >
                  {t('owner.workers')}
                </button>
              </div>
              <form
                className={section === 'info' ? PANEL : `${PANEL} hidden`}
                onSubmit={(e) => void onSubmitInfo(e)}
              >
                <label className="block text-sm text-body">
                  {t('owner.salonName')}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={FIELD}
                  />
                </label>
                <label className="block text-sm text-body">
                  {t('owner.address')}
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={FIELD}
                  />
                </label>
                {infoError ? <p className="text-sm text-busy-busy">{infoError}</p> : null}
                <button type="submit" disabled={savingSalon} className={SAVE_BTN}>
                  {t('owner.save')}
                </button>
              </form>
              <form
                className={section === 'hours' ? PANEL : `${PANEL} hidden`}
                onSubmit={(e) => void onSubmitHours(e)}
              >
                <h2 className="text-sm font-semibold text-ink">{t('salon.hours')}</h2>
                <ul className="space-y-3">
                  {days.map((day) => (
                    <li
                      key={day.weekday}
                      className={day.closed ? 'space-y-2 text-muted' : 'space-y-2 text-body'}
                    >
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-ink">{t(`weekday.${day.weekday}`)}</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={day.closed}
                            onChange={(e) => {
                              if (e.target.checked) {
                                patchDay(day.weekday, { closed: true })
                                return
                              }
                              patchDay(day.weekday, {
                                closed: false,
                                opensAt: day.opensAt || '09:00',
                                closesAt: day.closesAt || '17:00',
                              })
                            }}
                          />
                          {t('salon.closed')}
                        </label>
                      </div>
                      {day.closed ? null : (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="block text-sm">
                              {t('owner.opens')}
                              <input
                                type="time"
                                step={900}
                                value={day.opensAt}
                                onChange={(e) => patchDay(day.weekday, { opensAt: e.target.value })}
                                className={FIELD}
                              />
                            </label>
                            <label className="block text-sm">
                              {t('owner.closes')}
                              <input
                                type="time"
                                step={900}
                                value={day.closesAt}
                                onChange={(e) => patchDay(day.weekday, { closesAt: e.target.value })}
                                className={FIELD}
                              />
                            </label>
                          </div>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={day.breakOn}
                              onChange={(e) => {
                                if (!e.target.checked) {
                                  patchDay(day.weekday, { breakOn: false })
                                  return
                                }
                                patchDay(day.weekday, {
                                  breakOn: true,
                                  breakStartsAt: day.breakStartsAt || '12:00',
                                  breakEndsAt: day.breakEndsAt || '13:00',
                                })
                              }}
                            />
                            {t('owner.break')}
                          </label>
                          {day.breakOn ? (
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="time"
                                step={900}
                                value={day.breakStartsAt}
                                onChange={(e) =>
                                  patchDay(day.weekday, { breakStartsAt: e.target.value })
                                }
                                className="w-full border border-hairline bg-canvas px-3 py-2 text-ink"
                              />
                              <input
                                type="time"
                                step={900}
                                value={day.breakEndsAt}
                                onChange={(e) =>
                                  patchDay(day.weekday, { breakEndsAt: e.target.value })
                                }
                                className="w-full border border-hairline bg-canvas px-3 py-2 text-ink"
                              />
                            </div>
                          ) : null}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <label className="block text-sm text-body">
                  {t('owner.cancellationNotice')}
                  <input
                    type="number"
                    value={notice}
                    onChange={(e) => setNotice(e.target.value)}
                    className={FIELD}
                  />
                </label>
                {hoursError ? <p className="text-sm text-busy-busy">{hoursError}</p> : null}
                <button type="submit" disabled={savingHours} className={SAVE_BTN}>
                  {t('owner.save')}
                </button>
              </form>
              <section className={section === 'services' ? PANEL : `${PANEL} hidden`}>
                <h2 className="text-sm font-semibold text-ink">{t('salon.services')}</h2>
                {salon.services.length === 0 ? (
                  <p className="text-sm text-body">{t('salon.emptyServices')}</p>
                ) : (
                  <ul className="space-y-6">
                    {salon.services.map((row) => (
                      <li key={row.id}>
                        <SalonServiceForm salonId={salon.id} service={row} onSaved={refetch} />
                      </li>
                    ))}
                  </ul>
                )}
                <SalonServiceForm salonId={salon.id} onSaved={refetch} />
              </section>
              <section className={section === 'workers' ? PANEL : `${PANEL} hidden`}>
                <h2 className="text-sm font-semibold text-ink">{t('owner.workers')}</h2>
                {salon.workers.length === 0 ? (
                  <p className="text-sm text-body">{t('owner.noWorkers')}</p>
                ) : (
                  <ul className="space-y-6">
                    {salon.workers.map((row) => (
                      <li key={row.id}>
                        <SalonWorkerForm salonId={salon.id} worker={row} onSaved={refetch} />
                      </li>
                    ))}
                  </ul>
                )}
                <SalonWorkerForm salonId={salon.id} onSaved={refetch} />
              </section>
            </>
          )}
        </main>
      </div>
    </>
  )
}
