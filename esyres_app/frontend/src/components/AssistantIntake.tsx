import type { FormEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthShell } from './AuthShell'
import { EmailVerifyPanel } from './EmailVerifyPanel'
import { PhoneOtpPanel } from './PhoneOtpPanel'
import type { SalonService, SalonWorker } from '../graphql/salon'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import {
  ASSISTANT_COMPOSER_CLASS,
  ASSISTANT_GUEST_PILL_CLASS,
  ASSISTANT_SALON_LINE_CLASS,
  SALON_SEND_CLASS,
} from '../lib/salonSend'
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
import {
  pingChrome,
  unknownChipChrome,
} from '../lib/intake'
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
  unknownShown: boolean
  pinged: boolean
  onUnknown: () => void
  onPing: () => void
  needLogin: boolean
  needEmail: boolean
  needPhone: boolean
  onSend: (e: FormEvent) => void
  onAfterAuth: () => void
}

const chip = 'rounded-full border px-3 py-1.5 text-sm'
const chipIdle = `${chip} border-hairline text-ink`
const chipOn = `${chip} border-ink bg-ink text-canvas`

function SalonLine({ children }: { children: ReactNode }) {
  return <p className={ASSISTANT_SALON_LINE_CLASS}>{children}</p>
}

function GuestLine({ children }: { children: ReactNode }) {
  return <p className={ASSISTANT_GUEST_PILL_CLASS}>{children}</p>
}

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
  unknownShown,
  pinged,
  onUnknown,
  onPing,
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
  const escapeChrome = unknownChipChrome({ waiting, sent: false })
  const pingUi = pingChrome({ waiting, unknownShown, pinged })
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
  const empty = selected.length === 0 && !waiting
  const showWorker = selected.length > 0 && workers.length > 0

  return (
    <form className="flex h-full min-h-0 w-full flex-col" onSubmit={onSend}>
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <p className="font-display text-[32px] font-semibold tracking-tight text-ink">
            {t('assistant.hello', { name: assistantHelloName(salonName) })}
          </p>
          {addressLine !== null && <p className="mt-2 text-sm text-muted">{addressLine}</p>}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          <SalonLine>{t('assistant.hello', { name: assistantHelloName(salonName) })}</SalonLine>
          {addressLine !== null && <p className="text-sm text-muted">{addressLine}</p>}
          {chosen.length > 0 && <GuestLine>{chosen.map((s) => s.name).join(', ')}</GuestLine>}
          {showWorker && <SalonLine>{t('assistant.worker')}</SalonLine>}
          {workerConfirmed && <GuestLine>{pickedWorker}</GuestLine>}
          {(step === 'date' || timeStep) && <SalonLine>{t('assistant.date')}</SalonLine>}
          {timeStep && !dayClosed && <SalonLine>{t('assistant.time')}</SalonLine>}
          {step === 'send' && <SalonLine>{t('assistant.send')}</SalonLine>}
          {(unknownShown || pinged) && !waiting && <SalonLine>{t('assistant.unknown')}</SalonLine>}
          {waiting && <SalonLine>{t('assistant.wait')}</SalonLine>}
        </div>
      )}

      {!waiting && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
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

          {showWorker && (
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
          )}

          {(step === 'date' || timeStep) && (
            <label className="block w-full text-sm text-body">
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
          )}

          {timeStep && hoursLine !== null && <p className="w-full text-sm text-muted">{hoursLine}</p>}

          {timeStep && dayClosed && (
            <p className="w-full text-sm text-busy-busy">{t('salon.gate.SALON_CLOSED')}</p>
          )}

          {timeStep && !dayClosed && (
            <>
              <p className="w-full text-sm text-muted">{t(`salon.busy.${dayBusy}`)}</p>
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
                <label className="block w-full text-sm text-body">
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

          {escapeChrome === 'shown' && (
            <button type="button" className={chipIdle} onClick={onUnknown}>
              {t('assistant.other')}
            </button>
          )}
          {pingUi === 'cta' && (
            <button type="button" className="text-sm font-medium text-ink underline underline-offset-4" onClick={onPing}>
              {t('assistant.ping')}
            </button>
          )}
          {pingUi === 'done' && <p className="w-full text-sm text-muted">{t('assistant.pinged')}</p>}
          {error && <p className="w-full text-sm text-busy-busy">{error}</p>}
          {step === 'send' && chrome === 'submit' && (
            <button
              type="submit"
              disabled={!canSend || busy}
              className={SALON_SEND_CLASS}
            >
              {t('salon.send')}
            </button>
          )}
          {chrome === 'email' && <EmailVerifyPanel onRetry={onAfterAuth} />}
          {chrome === 'phone' && <PhoneOtpPanel onRetry={onAfterAuth} />}
          {chrome === 'login' && (
            <>
              <p className={PLACE_HEADING_CLASS}>{t('auth.placeCustomer')}</p>
              <AuthShell onAuthenticated={onAfterAuth} />
            </>
          )}
        </div>
      )}

      <div className={ASSISTANT_COMPOSER_CLASS}>
        <span className="flex size-8 shrink-0 items-center justify-center text-ink" aria-hidden="true">
          <svg className="size-4" viewBox="0 0 16 16">
            <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
        <p className="flex-1 text-sm text-muted">{t('assistant.prompt')}</p>
      </div>
    </form>
  )
}
