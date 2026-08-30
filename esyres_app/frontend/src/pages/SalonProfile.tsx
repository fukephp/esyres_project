import { useMutation, useQuery } from '@apollo/client'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { BookingsLink } from '../components/BookingsLink'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { PhoneOtpPanel } from '../components/PhoneOtpPanel'
import { CREATE_BOOKING_MUTATION, type CreateBookingInput } from '../graphql/booking'
import { PUBLIC_SALON_QUERY, type DayHours, type PublicSalonData, type SalonService } from '../graphql/salon'
import { graphqlErrorCode, stackSelection } from '../lib/booking'
import { busyToken } from '../lib/busyToken'
import { formatFeninga, sarajevoToday } from '../lib/format'

const busyBg = {
  'busy-free': 'bg-busy-free',
  'busy-moderate': 'bg-busy-moderate',
  'busy-busy': 'bg-busy-busy',
} as const

function hoursLine(day: DayHours, t: (key: string, opts?: Record<string, string>) => string): string {
  if (day.closed || !day.opensAt || !day.closesAt) {
    return t('salon.closed')
  }
  let line = `${day.opensAt}–${day.closesAt}`
  if (day.breakStartsAt && day.breakEndsAt) {
    line += ` · ${t('salon.break', { start: day.breakStartsAt, end: day.breakEndsAt })}`
  }
  return line
}

function gateMessage(
  code: string | null,
  t: (key: string) => string,
): string {
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
  if (code === 'INVALID_DATE' || code === 'INVALID_TIME') {
    return t('salon.gate.INVALID_DATE')
  }
  if (code === 'INVALID_CREDENTIALS') {
    return t('salon.gate.INVALID_CREDENTIALS')
  }
  return t('salon.gate.fallback')
}

export function SalonProfile() {
  const { id } = useParams()
  const { t } = useTranslation()
  const date = sarajevoToday()
  const { data, loading } = useQuery<PublicSalonData>(PUBLIC_SALON_QUERY, {
    variables: { id, date },
    skip: !id,
  })
  const [createBooking] = useMutation(CREATE_BOOKING_MUTATION)
  const [picking, setPicking] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [needLogin, setNeedLogin] = useState(false)
  const [needEmail, setNeedEmail] = useState(false)
  const [needPhone, setNeedPhone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-5 py-8 text-body">
        <BookingsLink />
        <p>{t('salon.loading')}</p>
      </main>
    )
  }

  const salon = data?.salon
  if (!salon) {
    return (
      <main className="mx-auto max-w-md px-5 py-8 text-body">
        <BookingsLink />
        <p>{t('salon.notFound')}</p>
      </main>
    )
  }

  const token = busyToken(salon.busyLevel)
  const chosen = salon.services.filter((s) => selected.includes(s.id))
  const stack = stackSelection(chosen)
  const canSend = chosen.length > 0 && preferredDate !== '' && preferredTime !== ''

  function toggle(service: SalonService) {
    setSelected((ids) =>
      ids.includes(service.id) ? ids.filter((id) => id !== service.id) : [...ids, service.id],
    )
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!id || !canSend || busy) {
      return
    }
    setBusy(true)
    setError(null)
    const input: CreateBookingInput = {
      salonId: id,
      serviceIds: selected,
      preferredDate,
      preferredTime,
    }
    try {
      await send(input)
    } finally {
      setBusy(false)
    }
  }

  async function afterAuth() {
    if (!id) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await send({
        salonId: id,
        serviceIds: selected,
        preferredDate,
        preferredTime,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <BookingsLink />
      <header className="flex items-start justify-between gap-4">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
          {salon.name}
        </h1>
        <p className="flex items-center gap-2 text-sm text-body">
          <span className={`size-2.5 shrink-0 rounded-full ${busyBg[token]}`} aria-hidden />
          {t(`salon.busy.${salon.busyLevel}`)}
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">{t('salon.hours')}</h2>
        <ul className="mt-3 space-y-2">
          {salon.hours.map((day) => (
            <li key={day.weekday} className="flex justify-between gap-4 text-sm text-body">
              <span>{t(`weekday.${day.weekday}`)}</span>
              <span className="text-right">{hoursLine(day, t)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">{t('salon.services')}</h2>
        {salon.services.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t('salon.emptyServices')}</p>
        ) : (
          <ul className="mt-3 divide-y divide-hairline">
            {salon.services.map((service) => (
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
                          {t(`category.${service.category}`)} · {t('salon.duration', { n: service.durationMinutes })}
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
                        {t(`category.${service.category}`)} · {t('salon.duration', { n: service.durationMinutes })}
                      </p>
                    </div>
                    <p className="text-sm text-ink">{formatFeninga(service.priceFeninga)}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {salon.services.length > 0 && !picking && !sent && (
        <button
          type="button"
          className="mt-8 w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas"
          onClick={() => setPicking(true)}
        >
          {t('salon.send')}
        </button>
      )}

      {picking && !sent && (
        <>
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            {chosen.length > 0 && (
              <p className="text-sm text-ink">
                {t('salon.total')}: {t('salon.duration', { n: stack.durationMinutes })} · {formatFeninga(stack.priceFeninga)}
              </p>
            )}
            <label className="block text-sm text-body">
              {t('salon.date')}
              <input
                type="date"
                required
                min={date}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
              />
            </label>
            <label className="block text-sm text-body">
              {t('salon.time')}
              <input
                type="time"
                required
                step={900}
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
              />
            </label>
            {error && <p className="text-sm text-busy-busy">{error}</p>}
            {!needLogin && !needEmail && !needPhone && (
              <button
                type="submit"
                disabled={!canSend || busy}
                className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas disabled:opacity-40"
              >
                {t('salon.submit')}
              </button>
            )}
          </form>
          {needEmail && (
            <div className="mt-8">
              <EmailVerifyPanel onRetry={() => afterAuth()} />
            </div>
          )}
          {needPhone && (
            <div className="mt-8">
              <PhoneOtpPanel onRetry={() => afterAuth()} />
            </div>
          )}
          {needLogin && (
            <div className="mt-8">
              <AuthShell onAuthenticated={() => afterAuth()} />
            </div>
          )}
        </>
      )}

      {sent && <p className="mt-8 text-sm text-ink">{t('salon.success')}</p>}
    </main>
  )
}
