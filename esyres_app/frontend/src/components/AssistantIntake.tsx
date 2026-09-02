import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthShell } from './AuthShell'
import { EmailVerifyPanel } from './EmailVerifyPanel'
import { PhoneOtpPanel } from './PhoneOtpPanel'
import type { SalonService, SalonWorker } from '../graphql/salon'
import { assistantCanSend, assistantStep } from '../lib/assistant'
import { formatFeninga } from '../lib/format'

type Props = {
  services: SalonService[]
  workers: SalonWorker[]
  minDate: string
  selected: string[]
  onToggleService: (id: string) => void
  workerChoice: string
  onPickWorker: (id: string) => void
  workerConfirmed: boolean
  preferredDate: string
  onDate: (value: string) => void
  preferredTime: string
  onTime: (value: string) => void
  error: string | null
  busy: boolean
  needLogin: boolean
  needEmail: boolean
  needPhone: boolean
  onSend: (e: FormEvent) => void
  onAfterAuth: () => void
}

const chip = 'rounded-full border px-3 py-1.5 text-sm'
const chipIdle = `${chip} border-hairline text-ink`
const chipOn = `${chip} border-ink bg-ink text-canvas`

export function AssistantIntake({
  services,
  workers,
  minDate,
  selected,
  onToggleService,
  workerChoice,
  onPickWorker,
  workerConfirmed,
  preferredDate,
  onDate,
  preferredTime,
  onTime,
  error,
  busy,
  needLogin,
  needEmail,
  needPhone,
  onSend,
  onAfterAuth,
}: Props) {
  const { t } = useTranslation()
  const step = assistantStep({
    serviceIds: selected,
    workerCount: workers.length,
    workerConfirmed,
    preferredDate,
    preferredTime,
  })
  const canSend = assistantCanSend(selected, preferredDate, preferredTime)
  const chosen = services.filter((s) => selected.includes(s.id))
  const pickedWorker =
    workerChoice === ''
      ? t('salon.noPreference')
      : (workers.find((w) => w.id === workerChoice)?.name ?? t('salon.noPreference'))

  return (
    <form className="mt-8 space-y-5" onSubmit={onSend}>
      <p className="text-sm text-ink">{t('assistant.services')}</p>
      {chosen.length > 0 && (
        <p className="text-sm text-muted">{chosen.map((s) => s.name).join(', ')}</p>
      )}
      <ul className="flex flex-wrap gap-2">
        {services.map((service) => {
          const on = selected.includes(service.id)
          return (
            <li key={service.id}>
              <button
                type="button"
                className={on ? chipOn : chipIdle}
                onClick={() => onToggleService(service.id)}
              >
                {service.name}
                <span className="ml-1 text-xs opacity-70">{formatFeninga(service.priceFeninga)}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {selected.length > 0 && workers.length > 0 && (
        <>
          <p className="text-sm text-ink">{t('assistant.worker')}</p>
          {workerConfirmed && <p className="text-sm text-muted">{pickedWorker}</p>}
          <ul className="flex flex-wrap gap-2">
            <li>
              <button
                type="button"
                className={workerConfirmed && workerChoice === '' ? chipOn : chipIdle}
                onClick={() => onPickWorker('')}
              >
                {t('salon.noPreference')}
              </button>
            </li>
            {workers.map((worker) => (
              <li key={worker.id}>
                <button
                  type="button"
                  className={workerConfirmed && workerChoice === worker.id ? chipOn : chipIdle}
                  onClick={() => onPickWorker(worker.id)}
                >
                  {worker.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {(step === 'date' || step === 'time' || step === 'send') && (
        <>
          <p className="text-sm text-ink">{t('assistant.date')}</p>
          <label className="block text-sm text-body">
            {t('salon.date')}
            <input
              type="date"
              required
              min={minDate}
              value={preferredDate}
              onChange={(e) => onDate(e.target.value)}
              className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
            />
          </label>
        </>
      )}

      {(step === 'time' || step === 'send') && (
        <>
          <p className="text-sm text-ink">{t('assistant.time')}</p>
          <label className="block text-sm text-body">
            {t('salon.time')}
            <input
              type="time"
              required
              step={900}
              value={preferredTime}
              onChange={(e) => onTime(e.target.value)}
              className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
            />
          </label>
        </>
      )}

      {step === 'send' && <p className="text-sm text-ink">{t('assistant.send')}</p>}
      {error && <p className="text-sm text-busy-busy">{error}</p>}
      {step === 'send' && !needLogin && !needEmail && !needPhone && (
        <button
          type="submit"
          disabled={!canSend || busy}
          className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas disabled:opacity-40"
        >
          {t('salon.submit')}
        </button>
      )}
      {needEmail && <EmailVerifyPanel onRetry={onAfterAuth} />}
      {needPhone && <PhoneOtpPanel onRetry={onAfterAuth} />}
      {needLogin && <AuthShell onAuthenticated={onAfterAuth} />}
    </form>
  )
}
