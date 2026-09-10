import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthShell } from './AuthShell'
import { EmailVerifyPanel } from './EmailVerifyPanel'
import { PhoneOtpPanel } from './PhoneOtpPanel'
import type { SalonService, SalonWorker } from '../graphql/salon'
import {
  assistantAddressLine,
  assistantCanSend,
  assistantHoursFacts,
  assistantHelloName,
  assistantSendChrome,
  assistantServiceChipParts,
  assistantStep,
  formatAssistantHoursLine,
  type AssistantDayHours,
} from '../lib/assistant'
import type { BusyLevel } from '../lib/busyToken'
import { formatFeninga } from '../lib/format'

type Props = {
  salonName: string
  address: string | null
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
  onPickSuggestion: (value: string) => void
  onNativeTime: (value: string) => void
  dayHours: AssistantDayHours | undefined
  dayClosed: boolean
  dayBusy: BusyLevel
  suggestions: string[]
  showOtherTime: boolean
  otherTime: boolean
  onOtherTime: () => void
  error: string | null
  busy: boolean
  waiting: boolean
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
  salonName,
  address,
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
  onPickSuggestion,
  onNativeTime,
  dayHours,
  dayClosed,
  dayBusy,
  suggestions,
  showOtherTime,
  otherTime,
  onOtherTime,
  error,
  busy,
  waiting,
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
  const chrome = assistantSendChrome({ needLogin, needEmail, needPhone })
  const chosen = services.filter((s) => selected.includes(s.id))
  const pickedWorker =
    workerChoice === ''
      ? t('salon.noPreference')
      : (workers.find((w) => w.id === workerChoice)?.name ?? t('salon.noPreference'))
  const timeStep = step === 'time' || step === 'send'
  const addressLine = assistantAddressLine(address)
  const hoursFacts = assistantHoursFacts(dayHours)
  const hoursLine =
    hoursFacts === null
      ? null
      : formatAssistantHoursLine(hoursFacts, {
          closed: t('salon.closed'),
          break: (start, end) => t('salon.break', { start, end }),
        })

  return (
    <form className="mt-8 space-y-5" onSubmit={onSend}>
      <p className="text-sm text-ink">{t('assistant.hello', { name: assistantHelloName(salonName) })}</p>
      {addressLine !== null && <p className="text-sm text-muted">{addressLine}</p>}
      <p className="text-sm text-ink">{t('assistant.services')}</p>
      {chosen.length > 0 && (
        <p className="text-sm text-muted">{chosen.map((s) => s.name).join(', ')}</p>
      )}
      {waiting && workerConfirmed && <p className="text-sm text-muted">{pickedWorker}</p>}
      {waiting && <p className="text-sm text-ink">{t('assistant.wait')}</p>}
      {!waiting && (
        <>
      <ul className="flex flex-wrap gap-2">
        {services.map((service) => {
          const on = selected.includes(service.id)
          const chipParts = assistantServiceChipParts(service)
          return (
            <li key={service.id}>
              <button
                type="button"
                className={on ? chipOn : chipIdle}
                onClick={() => onToggleService(service.id)}
              >
                {chipParts.name}
                <span className="ml-1 text-xs opacity-70">
                  {t('salon.duration', { n: chipParts.durationMinutes })} · {formatFeninga(chipParts.priceFeninga)}
                </span>
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

      {(step === 'date' || timeStep) && (
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

      {timeStep && hoursLine !== null && <p className="text-sm text-muted">{hoursLine}</p>}

      {timeStep && dayClosed && (
        <p className="text-sm text-busy-busy">{t('salon.gate.SALON_CLOSED')}</p>
      )}

      {timeStep && !dayClosed && (
        <>
          <p className="text-sm text-muted">{t(`salon.busy.${dayBusy}`)}</p>
          <p className="text-sm text-ink">{t('assistant.time')}</p>
          {suggestions.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {suggestions.map((time) => (
                <li key={time}>
                  <button
                    type="button"
                    className={!otherTime && preferredTime === time ? chipOn : chipIdle}
                    onClick={() => onPickSuggestion(time)}
                  >
                    {time}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showOtherTime && (
            <button
              type="button"
              className="text-sm text-body underline underline-offset-4"
              onClick={onOtherTime}
            >
              {t('assistant.otherTime')}
            </button>
          )}
          {otherTime && (
            <label className="block text-sm text-body">
              {t('salon.time')}
              <input
                type="time"
                required
                step={900}
                value={preferredTime}
                onChange={(e) => onNativeTime(e.target.value)}
                className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
              />
            </label>
          )}
        </>
      )}

      {step === 'send' && <p className="text-sm text-ink">{t('assistant.send')}</p>}
      {error && <p className="text-sm text-busy-busy">{error}</p>}
      {step === 'send' && chrome === 'submit' && (
        <button
          type="submit"
          disabled={!canSend || busy}
          className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas disabled:opacity-40"
        >
          {t('salon.submit')}
        </button>
      )}
      {chrome === 'email' && <EmailVerifyPanel onRetry={onAfterAuth} />}
      {chrome === 'phone' && <PhoneOtpPanel onRetry={onAfterAuth} />}
      {chrome === 'login' && <AuthShell onAuthenticated={onAfterAuth} />}
        </>
      )}
    </form>
  )
}
