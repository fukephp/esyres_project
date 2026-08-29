import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { PUBLIC_SALON_QUERY, type DayHours, type PublicSalonData } from '../graphql/salon'
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

export function SalonProfile() {
  const { id } = useParams()
  const { t } = useTranslation()
  const date = sarajevoToday()
  const { data, loading } = useQuery<PublicSalonData>(PUBLIC_SALON_QUERY, {
    variables: { id, date },
    skip: !id,
  })

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-5 py-8 text-body">
        <p>{t('salon.loading')}</p>
      </main>
    )
  }

  const salon = data?.salon
  if (!salon) {
    return (
      <main className="mx-auto max-w-md px-5 py-8 text-body">
        <p>{t('salon.notFound')}</p>
      </main>
    )
  }

  const token = busyToken(salon.busyLevel)

  return (
    <main className="mx-auto max-w-md px-5 py-8">
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
              <li key={service.id} className="flex items-baseline justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{service.name}</p>
                  <p className="text-xs text-muted">
                    {t(`category.${service.category}`)} · {t('salon.duration', { n: service.durationMinutes })}
                  </p>
                </div>
                <p className="text-sm text-ink">{formatFeninga(service.priceFeninga)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
