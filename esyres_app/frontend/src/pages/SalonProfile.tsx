import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { TopNav } from '../components/TopNav'
import { GuestPageSkeleton, SalonProfileSkeleton } from '../components/Skeleton'
import { PhoneOtpPanel } from '../components/PhoneOtpPanel'
import { Alert, CloseButton, Spinner } from '../components/ui'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { SAVE_FAVORITE, UNSAVE_FAVORITE } from '../graphql/favorites'
import {
  CREATE_BOOKING_MUTATION,
  QUARTER_STARTS_QUERY,
  type CreateBookingInput,
  type QuarterStartsData,
} from '../graphql/booking'
import { PUBLIC_SALON_QUERY, type DayHours, type PublicSalonData, type SalonService, type SalonServiceCategory } from '../graphql/salon'
import { SalonRatingBlock } from './SalonRating'
import { assistantAddressLine, assistantHoursFacts, assistantHoursForDate, formatAssistantHoursLine } from '../lib/assistant'
import { bookingWorkerId, graphqlErrorCode, stackSelection } from '../lib/booking'
import { CUSTOMER_SMALL_BUTTON } from '../lib/customerUi'
import { quarterNoneTappable, quarterStartPast } from '../lib/guestQuarter'
import { busyToken } from '../lib/busyToken'
import { formatFeninga, sarajevoToday } from '../lib/format'
import { GUEST_COLUMN_CLASS } from '../lib/homepage'
import {
  formatPickerDayNumeric,
  guestAfterServiceChange,
  guestDayChange,
  guestHoursSkip,
  hoursRowClosed,
  sarajevoWeekdayFromYmd,
  type GuestDayChip,
} from '../lib/salonHours'
import {
  SALON_BOOKING_ASIDE_CLASS,
  SALON_BOOKING_MAIN_CLASS,
  SALON_BOOKING_SPLIT_CLASS,
  SALON_PICKER_DIALOG_CLASS,
  SALON_SEND_CLASS,
} from '../lib/salonSend'

const busyBg = {
  'busy-free': 'bg-busy-free',
  'busy-moderate': 'bg-busy-moderate',
  'busy-busy': 'bg-busy-busy',
} as const

const CHIP_ON = 'rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas'
const CHIP_OFF = 'rounded-full border border-hairline px-3 py-1.5 text-sm text-ink'

function hoursLine(day: DayHours, t: (key: string, opts?: Record<string, string>) => string): string {
  const facts = assistantHoursFacts(day)
  if (facts === null) {
    return t('salon.closed')
  }

  return formatAssistantHoursLine(facts, {
    closed: t('salon.closed'),
    break: (start, end) => t('salon.break', { start, end }),
  })
}

function gateMessage(code: string | null, t: (key: string) => string): string {
  if (code === 'EMAIL_UNVERIFIED') {
    return t('salon.gate.EMAIL_UNVERIFIED')
  }
  if (code === 'PHONE_UNVERIFIED') {
    return t('salon.gate.PHONE_UNVERIFIED')
  }
  if (code === 'INVALID_SERVICES') {
    return t('salon.gate.INVALID_SERVICES')
  }
  if (code === 'INVALID_WORKER') {
    return t('salon.gate.INVALID_WORKER')
  }
  if (code === 'SALON_CLOSED') {
    return t('salon.gate.SALON_CLOSED')
  }
  if (code === 'PAST_TIME') {
    return t('salon.gate.PAST_TIME')
  }
  if (code === 'INVALID_DATE' || code === 'INVALID_TIME' || code === 'INVALID_TIME_STEP') {
    return t('salon.gate.INVALID_TIME_STEP')
  }
  if (code === 'OUTSIDE_HOURS') {
    return t('salon.gate.OUTSIDE_HOURS')
  }
  if (code === 'DURING_BREAK') {
    return t('salon.gate.DURING_BREAK')
  }
  if (code === 'SLOT_TAKEN') {
    return t('salon.gate.SLOT_TAKEN')
  }
  if (code === 'SAME_DAY_SERVICE') {
    return t('salon.gate.SAME_DAY_SERVICE')
  }
  if (code === 'INVALID_CREDENTIALS') {
    return t('salon.gate.INVALID_CREDENTIALS')
  }
  return t('salon.gate.fallback')
}

function visibleServiceGroups(categories: SalonServiceCategory[]): SalonServiceCategory[] {
  return categories.filter((group) => group.services.length > 0)
}

function SalonServiceGroups({
  categories,
  picking,
  selected,
  toggle,
}: {
  categories: SalonServiceCategory[]
  picking: boolean
  selected: string[]
  toggle: (service: SalonService) => void
}) {
  const { t } = useTranslation()
  const visible = visibleServiceGroups(categories)
  const showJump = visible.length >= 2

  return (
    <div className={showJump ? 'md:flex md:gap-8' : undefined}>
      <div className="min-w-0 flex-1 space-y-8">
        {visible.map((group) => (
          <div key={group.id} id={`svc-cat-${group.id}`}>
            <h3 className="text-sm font-semibold text-ink">{group.name}</h3>
            <ul className="mt-3 divide-y divide-hairline">
              {group.services.map((service) => (
                <li key={service.id} className="py-3">
                  {picking ? (
                    <label className="flex cursor-pointer items-baseline justify-between gap-4">
                      <span className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selected.includes(service.id)}
                          onChange={() => toggle(service)}
                        />
                        <span>
                          <span className="block text-sm font-medium text-ink">{service.name}</span>
                          <span className="text-xs text-muted">
                            {t('salon.duration', { n: service.durationMinutes })}
                          </span>
                        </span>
                      </span>
                      <span className="text-sm text-ink">{formatFeninga(service.priceFeninga)}</span>
                    </label>
                  ) : (
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-ink">{service.name}</p>
                        <p className="text-xs text-muted">
                          {t('salon.duration', { n: service.durationMinutes })}
                        </p>
                      </div>
                      <p className="text-sm text-ink">{formatFeninga(service.priceFeninga)}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {showJump ? (
        <nav className="hidden w-40 shrink-0 md:block">
          <ul className="space-y-2">
            {visible.map((group) => (
              <li key={group.id}>
                <a href={`#svc-cat-${group.id}`} className="text-sm text-body">
                  {group.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}

export function SalonProfile() {
  const { id } = useParams()
  const { t } = useTranslation()
  const date = sarajevoToday()
  const { data, loading, refetch } = useQuery<PublicSalonData>(PUBLIC_SALON_QUERY, {
    variables: { id, date, chosenDate: date },
    skip: !id,
  })
  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery<MeData>(ME_QUERY)
  const [saveFavorite] = useMutation(SAVE_FAVORITE)
  const [unsaveFavorite] = useMutation(UNSAVE_FAVORITE)
  const [favoriteBusy, setFavoriteBusy] = useState(false)
  const navMe = meLoading ? null : (meData?.me ?? null)
  const [createBooking] = useMutation(CREATE_BOOKING_MUTATION)
  const [mode, setMode] = useState<'idle' | 'picker'>('idle')
  const [sent, setSent] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [chip, setChip] = useState<GuestDayChip>('today')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [workerChoice, setWorkerChoice] = useState('')
  const quarterWorkerId = workerChoice === '' ? null : workerChoice
  const { data: quarterData, loading: quartersLoading } = useQuery<QuarterStartsData>(QUARTER_STARTS_QUERY, {
    variables: {
      salonId: id ?? '',
      date: preferredDate,
      serviceIds: selected,
      workerId: quarterWorkerId,
    },
    skip: !id || mode !== 'picker' || selected.length === 0 || preferredDate === '',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })
  const quarters = quartersLoading || quarterData === undefined ? null : quarterData.quarterStarts
  const [needLogin, setNeedLogin] = useState(false)
  const [needEmail, setNeedEmail] = useState(false)
  const [needPhone, setNeedPhone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const pickerDialogRef = useRef<HTMLDialogElement>(null)
  const allowClose = useRef(false)

  useEffect(() => {
    const picker = pickerDialogRef.current
    if (picker == null) {
      return
    }
    if (mode === 'picker') {
      if (!picker.open) {
        picker.showModal()
      }
    } else if (picker.open) {
      picker.close()
    }
  }, [mode])

  useEffect(() => {
    if (quarters === null) {
      return
    }
    setPreferredTime((current) =>
      guestAfterServiceChange(
        current,
        quarters
          .filter((row) => !row.booked && !quarterStartPast(preferredDate, row.time, date, new Date()))
          .map((row) => row.time),
      ),
    )
  }, [quarters, preferredDate, date])

  if (loading) {
    return (
      <>
        <TopNav me={navMe} />
        <GuestPageSkeleton>
          <SalonProfileSkeleton />
        </GuestPageSkeleton>
      </>
    )
  }

  const salon = data?.salon
  if (!salon) {
    return (
      <>
        <TopNav me={navMe} />
        <main className={`${GUEST_COLUMN_CLASS} py-8 text-body`}>
          <p>{t('salon.notFound')}</p>
        </main>
      </>
    )
  }

  const token = busyToken(salon.busyLevel)
  const addressLine = assistantAddressLine(salon.address)
  const hasServices = salon.services.length > 0
  const chosen = salon.services.filter((service) => selected.includes(service.id))
  const stack = stackSelection(chosen)
  const showBookingColumn = hasServices
  const showLogin = (!meLoading && meData?.me == null) || needLogin
  const pickerDay = preferredDate === '' ? undefined : assistantHoursForDate(salon.hours, preferredDate)
  const pickerClosed =
    preferredDate !== '' &&
    (pickerDay === undefined || pickerDay.closed || pickerDay.opensAt === null || pickerDay.closesAt === null)
  const quarterPast = (time: string) => quarterStartPast(preferredDate, time, date, new Date())
  const canSendPicker = chosen.length > 0 && preferredDate !== '' && !pickerClosed

  function toggle(service: SalonService) {
    setSelected((ids) => (ids.includes(service.id) ? ids.filter((sid) => sid !== service.id) : [...ids, service.id]))
  }

  function applyDay(action: { chip: GuestDayChip } | { date: string }) {
    const next = guestDayChange(date, action)
    setChip(next.chip)
    setPreferredDate(next.date)
    setPreferredTime(next.time)
    setWorkerChoice(next.workerId)
  }

  function openPicker() {
    if (!salon) {
      return
    }
    const skip = guestHoursSkip(date, salon.hours)
    setChip(skip.chip)
    setPreferredDate(skip.date)
    setSelected([])
    setPreferredTime('')
    setWorkerChoice('')
    setSent(false)
    setNeedLogin(false)
    setNeedEmail(false)
    setNeedPhone(false)
    setError(null)
    allowClose.current = false
    setMode('picker')
  }

  function closePicker() {
    allowClose.current = true
    setSent(false)
    setMode('idle')
  }

  function bookingInput(): CreateBookingInput | null {
    if (!id) {
      return null
    }
    const input: CreateBookingInput = {
      salonId: id,
      serviceIds: selected,
      preferredDate,
    }
    if (preferredTime !== '') {
      input.preferredTime = preferredTime
    }
    const workerId = bookingWorkerId(workerChoice)
    if (workerId !== undefined) {
      input.workerId = workerId
    }
    return input
  }

  async function send(input: CreateBookingInput) {
    try {
      await createBooking({ variables: { input } })
      setSent(true)
      setNeedLogin(false)
      setNeedEmail(false)
      setNeedPhone(false)
      setError(null)
    } catch (err) {
      const code = graphqlErrorCode(err)
      if (code === 'UNAUTHENTICATED') {
        setNeedLogin(true)
        setNeedEmail(false)
        setNeedPhone(false)
        setError(null)
        return
      }
      if (code === 'EMAIL_UNVERIFIED') {
        setNeedEmail(true)
        setNeedLogin(false)
        setNeedPhone(false)
        setError(null)
        return
      }
      if (code === 'PHONE_UNVERIFIED') {
        setNeedPhone(true)
        setNeedLogin(false)
        setNeedEmail(false)
        setError(null)
        return
      }
      setNeedEmail(false)
      setNeedPhone(false)
      setError(gateMessage(code, t))
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!id || !canSendPicker || busy || sent) {
      return
    }
    const input = bookingInput()
    if (!input) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await send(input)
    } finally {
      setBusy(false)
    }
  }

  async function onVerified() {
    setNeedEmail(false)
    setNeedPhone(false)
    const input = bookingInput()
    if (!input || !canSendPicker || busy) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await send(input)
    } finally {
      setBusy(false)
    }
  }

  const catalog = (
    <>
      <section className={showBookingColumn ? undefined : 'mt-8'}>
        <h2 className="text-sm font-semibold text-ink">{t('salon.hours')}</h2>
        <ul className="mt-3 space-y-2">
          {salon.hours.map((day) => {
            const closed = hoursRowClosed(day)
            return (
              <li
                key={day.weekday}
                className={`flex justify-between gap-4 px-2 py-1.5 text-sm ${closed ? 'text-muted' : 'text-body'}`}
              >
                <span>{t(`weekday.${day.weekday}`)}</span>
                <span className="text-right">{hoursLine(day, t)}</span>
              </li>
            )
          })}
        </ul>
        {hasServices ? (
          <div className="mt-4">
            <button type="button" className={SALON_SEND_CLASS} onClick={openPicker}>
              {t('salon.send')}
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">{t('salon.services')}</h2>
        {salon.services.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t('salon.emptyServices')}</p>
        ) : (
          <div className="mt-3">
            <SalonServiceGroups categories={salon.serviceCategories} picking={false} selected={selected} toggle={toggle} />
          </div>
        )}
      </section>
      <SalonRatingBlock
        salonId={salon.id}
        average={salon.ratingAverage}
        count={salon.ratingCount}
        me={meData?.me ?? null}
        onRated={() => {
          void refetch()
        }}
      />
    </>
  )

  return (
    <>
      <TopNav me={navMe} />
      <main className={`${GUEST_COLUMN_CLASS} py-8`}>
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{salon.name}</h1>
            {meData?.me != null ? (
              <button
                type="button"
                disabled={favoriteBusy}
                className={`mt-2 ${CUSTOMER_SMALL_BUTTON}`}
                onClick={() => {
                  if (favoriteBusy) {
                    return
                  }
                  const saved = (meData.me?.favoriteSalonIds ?? []).includes(salon.id)
                  const run = saved ? unsaveFavorite : saveFavorite
                  setFavoriteBusy(true)
                  void run({ variables: { salonId: salon.id } })
                    .then(() => refetchMe())
                    .finally(() => setFavoriteBusy(false))
                }}
              >
                {favoriteBusy ? <Spinner /> : null}
                {(meData.me.favoriteSalonIds ?? []).includes(salon.id) ? t('salon.saved') : t('salon.save')}
              </button>
            ) : null}
          </div>
          <p className="flex items-center gap-2 text-sm text-body">
            <span className={`size-2.5 shrink-0 rounded-full ${busyBg[token]}`} aria-hidden />
            {t(`salon.busy.${salon.busyLevel}`)}
          </p>
        </header>

        {addressLine !== null ? <p className="mt-3 text-sm text-muted">{addressLine}</p> : null}

        {showBookingColumn ? (
          <div className={SALON_BOOKING_SPLIT_CLASS}>
            <aside className={SALON_BOOKING_ASIDE_CLASS} aria-hidden="true" />
            <div className={SALON_BOOKING_MAIN_CLASS}>{catalog}</div>
          </div>
        ) : (
          catalog
        )}

        <dialog
          ref={pickerDialogRef}
          className={SALON_PICKER_DIALOG_CLASS}
          onCancel={(event) => {
            event.preventDefault()
          }}
          onClose={() => {
            if (allowClose.current) {
              allowClose.current = false
              return
            }
            queueMicrotask(() => pickerDialogRef.current?.showModal())
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-[28px] font-semibold tracking-tight text-ink">{salon.name}</h2>
              {preferredDate !== '' ? (
                <p className="mt-1 text-sm text-muted">
                  {t(`weekday.${sarajevoWeekdayFromYmd(preferredDate)}`)}, {formatPickerDayNumeric(preferredDate)}
                </p>
              ) : null}
            </div>
            <CloseButton onClick={closePicker} />
          </div>
          {sent ? (
            <Alert variant="success">{t('salon.success')}</Alert>
          ) : showLogin ? (
            <div>
              <p className="text-sm text-body">{t('salon.loginToRequest')}</p>
              <div className="mt-4">
                <AuthShell variant="modal" onAuthenticated={() => setNeedLogin(false)} />
              </div>
            </div>
          ) : meLoading ? null : (
            <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
              <SalonServiceGroups
                categories={salon.serviceCategories}
                picking={true}
                selected={selected}
                toggle={toggle}
              />
              {chosen.length > 0 && (
                <p className="text-sm text-ink">
                  {t('salon.total')}: {t('salon.duration', { n: stack.durationMinutes })} · {formatFeninga(stack.priceFeninga)}
                </p>
              )}
              {salon.workers.length > 0 && (
                <fieldset>
                  <legend className="text-sm text-body">{t('salon.worker')}</legend>
                  <ul className="mt-2 space-y-2">
                    <li>
                      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                        <input
                          type="radio"
                          name="worker"
                          value=""
                          checked={workerChoice === ''}
                          onChange={() => setWorkerChoice('')}
                        />
                        {t('salon.noPreference')}
                      </label>
                    </li>
                    {salon.workers.map((worker) => (
                      <li key={worker.id}>
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                          <input
                            type="radio"
                            name="worker"
                            value={worker.id}
                            checked={workerChoice === worker.id}
                            onChange={() => setWorkerChoice(worker.id)}
                          />
                          {worker.name}
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}
              <div className="flex flex-wrap gap-2">
                {(['today', 'tomorrow', 'other'] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={chip === id}
                    onClick={() => applyDay({ chip: id })}
                    className={chip === id ? CHIP_ON : CHIP_OFF}
                  >
                    {t(id === 'today' ? 'salon.today' : id === 'tomorrow' ? 'salon.tomorrow' : 'salon.otherDay')}
                  </button>
                ))}
              </div>
              {chip === 'other' ? (
                <label className="block text-sm text-body">
                  {t('salon.date')}
                  <input
                    type="date"
                    min={date}
                    value={preferredDate}
                    onChange={(event) => applyDay({ date: event.target.value })}
                    className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
                  />
                </label>
              ) : null}
              {chosen.length > 0 && preferredDate !== '' ? (
                <div>
                  <p className="text-sm text-body">{t('salon.time')}</p>
                  {pickerClosed ? <Alert variant="warning" className="mt-2">{t('salon.gate.SALON_CLOSED')}</Alert> : null}
                  {!pickerClosed && quarters !== null && quarterNoneTappable(quarters, quarterPast) ? (
                    <Alert variant="info" className="mt-2">{t('salon.quarter.none')}</Alert>
                  ) : null}
                  {!pickerClosed && quarters !== null && quarters.length > 0 && preferredTime === '' ? (
                    <p className="mt-2 text-sm text-muted">{t('salon.quarter.dayOnly')}</p>
                  ) : null}
                  {!pickerClosed && quarters !== null && quarters.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {quarters.map((choice) => {
                        const past = quarterPast(choice.time)
                        const disabled = choice.booked || past
                        const pressed = preferredTime === choice.time && !disabled
                        return (
                          <button
                            key={choice.time}
                            type="button"
                            disabled={disabled}
                            aria-pressed={pressed}
                            onClick={() => {
                              if (!disabled) {
                                setPreferredTime(choice.time)
                              }
                            }}
                            className={
                              disabled
                                ? 'rounded-full border border-hairline px-3 py-1.5 text-sm text-muted disabled:opacity-40'
                                : pressed
                                  ? 'rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-canvas'
                                  : 'rounded-full border border-hairline px-3 py-1.5 text-sm text-ink'
                            }
                          >
                            {choice.booked && !past ? `${choice.time} ${t('salon.quarter.booked')}` : choice.time}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {error ? <Alert variant="error">{error}</Alert> : null}
              {!needEmail && !needPhone && (
                <button type="submit" disabled={!canSendPicker || busy} className={SALON_SEND_CLASS}>
                  {busy ? <Spinner className="mr-2 size-4" /> : null}
                  {t('salon.send')}
                </button>
              )}
            </form>
          )}
          {!sent && !showLogin && needEmail ? (
            <div className="mt-8">
              <EmailVerifyPanel onRetry={() => onVerified()} />
            </div>
          ) : null}
          {!sent && !showLogin && needPhone ? (
            <div className="mt-8">
              <PhoneOtpPanel onRetry={() => void onVerified()} />
            </div>
          ) : null}
        </dialog>
      </main>
    </>
  )
}
