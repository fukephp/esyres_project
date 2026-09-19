import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { AssistantIntake } from '../components/AssistantIntake'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { TopNav } from '../components/TopNav'
import { PhoneOtpPanel } from '../components/PhoneOtpPanel'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { CREATE_BOOKING_MUTATION, type CreateBookingInput } from '../graphql/booking'
import {
  ASSISTANT_INTAKE_QUERY,
  PING_ASSISTANT_INTAKE_MUTATION,
  UPSERT_ASSISTANT_INTAKE_MUTATION,
  type AssistantIntakeData,
  type PingAssistantIntakeData,
  type UpsertAssistantIntakeData,
} from '../graphql/intake'
import { PUBLIC_SALON_QUERY, type DayHours, type PublicSalonData, type SalonService, type SalonServiceCategory } from '../graphql/salon'
import {
  assistantAddressLine,
  assistantBookingInput,
  assistantCanSend,
  assistantDateChange,
  assistantHoursFacts,
  assistantHoursForDate,
  assistantShowOtherTime,
  formatAssistantHoursLine,
  isChatOpen,
  isPickerOpen,
  showChatCta,
  suggestPreferredTimes,
  type ProfileMode,
} from '../lib/assistant'
import { bookingWorkerId, graphqlErrorCode, stackSelection } from '../lib/booking'
import { dialogCancelShouldClose } from '../lib/salonDialog'
import { busyToken } from '../lib/busyToken'
import { formatFeninga, sarajevoNowMinutes, sarajevoToday } from '../lib/format'
import { GUEST_COLUMN_CLASS, PLACE_HEADING_CLASS } from '../lib/homepage'
import {
  applyHoursRowTap,
  formatPickerDayNumeric,
  hoursRowClosed,
  hoursRowSelected,
  hoursRowTappable,
  sarajevoWeekdayFromYmd,
  showDaySendPill,
} from '../lib/salonHours'
import {
  SALON_BOOKING_ASIDE_CLASS,
  SALON_BOOKING_MAIN_CLASS,
  SALON_BOOKING_SPLIT_CLASS,
  SALON_CHAT_CARD_CLASS,
  SALON_PICKER_DIALOG_CLASS,
  SALON_SEND_CLASS,
} from '../lib/salonSend'
import {
  clearIntakeToken,
  emptyIntakeSnapshot,
  intakeSnapshotFromRow,
  intakeWaiting,
  isEmptyIntakeSnapshot,
  readIntakeToken,
  shouldRestoreIntake,
  shouldUpsertIntake,
  withIntakeToken,
  writeIntakeToken,
  type IntakeSnapshot,
} from '../lib/intake'

const busyBg = {
  'busy-free': 'bg-busy-free',
  'busy-moderate': 'bg-busy-moderate',
  'busy-busy': 'bg-busy-busy',
} as const

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
  const [chatDate, setChatDate] = useState('')
  const [chatTime, setChatTime] = useState('')
  const [chatWorker, setChatWorker] = useState('')
  const [chatWorkerConfirmed, setChatWorkerConfirmed] = useState(false)
  const [chatOtherTime, setChatOtherTime] = useState(false)
  const { data, loading } = useQuery<PublicSalonData>(PUBLIC_SALON_QUERY, {
    variables: { id, date, chosenDate: chatDate !== '' ? chatDate : date },
    skip: !id,
  })
  const { data: meData, loading: meLoading } = useQuery<MeData>(ME_QUERY)
  const navMe = meLoading ? null : (meData?.me ?? null)
  const [createBooking] = useMutation(CREATE_BOOKING_MUTATION)
  const [mode, setMode] = useState<ProfileMode>('idle')
  const [selected, setSelected] = useState<string[]>([])
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [workerChoice, setWorkerChoice] = useState('')
  const [chatSelected, setChatSelected] = useState<string[]>([])
  const [needLogin, setNeedLogin] = useState(false)
  const [needEmail, setNeedEmail] = useState(false)
  const [needPhone, setNeedPhone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [intakeToken, setIntakeToken] = useState<string | null>(() => (id ? readIntakeToken(id) : null))
  const [unknownShown, setUnknownShown] = useState(false)
  const [pinged, setPinged] = useState(false)
  const lastSnapshot = useRef<IntakeSnapshot>(emptyIntakeSnapshot())
  const restored = useRef(false)
  const pickerDialogRef = useRef<HTMLDialogElement>(null)
  const chatDialogRef = useRef<HTMLDialogElement>(null)
  const keepPickerOpen = useRef(false)
  const keepChatOpen = useRef(false)
  const { data: savedIntake, refetch: refetchIntake } = useQuery<AssistantIntakeData>(ASSISTANT_INTAKE_QUERY, {
    variables: { token: intakeToken ?? '' },
    skip: !intakeToken,
    fetchPolicy: 'network-only',
  })
  const [upsertIntake] = useMutation<UpsertAssistantIntakeData>(UPSERT_ASSISTANT_INTAKE_MUTATION)
  const [pingIntake] = useMutation<PingAssistantIntakeData>(PING_ASSISTANT_INTAKE_MUTATION)

  useEffect(() => {
    restored.current = false
    lastSnapshot.current = emptyIntakeSnapshot()
    setIntakeToken(id ? readIntakeToken(id) : null)
    setUnknownShown(false)
    setPinged(false)
  }, [id])

  useEffect(() => {
    const row = savedIntake?.assistantIntake ?? null
    if (row === null || restored.current || !shouldRestoreIntake(intakeSnapshotFromRow(row), row.pinged)) {
      return
    }
    restored.current = true
    const snapshot = intakeSnapshotFromRow(row)
    lastSnapshot.current = snapshot
    setChatSelected(snapshot.serviceIds)
    setChatWorker(snapshot.workerId ?? '')
    setChatWorkerConfirmed(snapshot.workerConfirmed)
    setChatDate(snapshot.preferredDate)
    setChatTime(snapshot.preferredTime)
    setPinged(row.pinged)
    setUnknownShown(row.pinged)
    setMode('chat')
  }, [savedIntake])

  const waiting = intakeWaiting(savedIntake?.assistantIntake?.takenOver === true)

  useEffect(() => {
    function refresh() {
      if (intakeToken) {
        void refetchIntake()
      }
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intakeToken, refetchIntake])

  useEffect(() => {
    const picker = pickerDialogRef.current
    if (picker != null) {
      if (mode === 'picker') {
        if (!picker.open) {
          picker.showModal()
        }
      } else if (picker.open) {
        picker.close()
      }
    }
    const chat = chatDialogRef.current
    if (chat != null) {
      if (mode === 'chat') {
        if (!chat.open) {
          chat.showModal()
        }
      } else if (chat.open) {
        chat.close()
      }
    }
  }, [mode])

  const chatSnapshot: IntakeSnapshot = {
    serviceIds: chatSelected,
    workerId: chatWorker === '' ? null : chatWorker,
    workerConfirmed: chatWorkerConfirmed,
    preferredDate: chatDate,
    preferredTime: chatTime,
  }

  useEffect(() => {
    if (!id || mode !== 'chat') {
      return
    }
    if (!shouldUpsertIntake(lastSnapshot.current, chatSnapshot, waiting)) {
      return
    }
    lastSnapshot.current = chatSnapshot
    void upsertIntake({
      variables: {
        input: {
          salonId: id,
          token: intakeToken,
          serviceIds: chatSnapshot.serviceIds,
          workerId: chatSnapshot.workerId,
          workerConfirmed: chatSnapshot.workerConfirmed,
          preferredDate: chatSnapshot.preferredDate === '' ? null : chatSnapshot.preferredDate,
          preferredTime: chatSnapshot.preferredTime === '' ? null : chatSnapshot.preferredTime,
        },
      },
    }).then((result) => {
      const token = result.data?.upsertAssistantIntake.token
      if (typeof token === 'string') {
        writeIntakeToken(id, token)
        setIntakeToken(token)
      }
    }).catch((err: unknown) => {
      if (graphqlErrorCode(err) === 'INTAKE_TAKEN_OVER') {
        void refetchIntake()
      }
    })
  }, [id, mode, chatSnapshot, intakeToken, upsertIntake, waiting, refetchIntake])

  if (loading) {
    return (
      <>
        <TopNav me={navMe} />
        <main className={`${GUEST_COLUMN_CLASS} py-8 text-body`}>
          <p>{t('salon.loading')}</p>
        </main>
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
  const chosen = salon.services.filter((s) => selected.includes(s.id))
  const stack = stackSelection(chosen)
  const picking = isPickerOpen(mode)
  const chatting = isChatOpen(mode)
  const sent = mode === 'sent'
  const showBookingColumn = hasServices && !sent
  const canSendPicker = chosen.length > 0 && preferredDate !== '' && preferredTime !== ''
  const canSendChat = assistantCanSend(chatSelected, chatDate, chatTime)
  const showChatCard = showChatCta(salon.services.length, sent)
  const hoursForDay = chatDate === '' ? undefined : assistantHoursForDate(salon.hours, chatDate)
  const dayClosed =
    hoursForDay === undefined ||
    hoursForDay.closed ||
    hoursForDay.opensAt === null ||
    hoursForDay.closesAt === null
  const suggestions = suggestPreferredTimes({
    hoursForDay,
    busyLevel: salon.chatBusyLevel,
    date: chatDate,
    today: date,
    nowMinutes: chatDate === date ? sarajevoNowMinutes() : undefined,
  })

  function toggle(service: SalonService) {
    setSelected((ids) =>
      ids.includes(service.id) ? ids.filter((id) => id !== service.id) : [...ids, service.id],
    )
  }

  async function send(input: CreateBookingInput) {
    try {
      await createBooking({ variables: { input } })
      setMode('sent')
      setNeedLogin(false)
      setNeedEmail(false)
      setNeedPhone(false)
      setError(null)
      if (id && chatting) {
        clearIntakeToken(id)
        setIntakeToken(null)
        lastSnapshot.current = emptyIntakeSnapshot()
        setUnknownShown(false)
        setPinged(false)
      }
    } catch (err) {
      const code = graphqlErrorCode(err)
      if (code === 'INTAKE_TAKEN_OVER') {
        void refetchIntake()
        setError(null)
        return
      }
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

  function openIntake(next: 'picker' | 'chat') {
    setMode(next)
    setNeedLogin(false)
    setNeedEmail(false)
    setNeedPhone(false)
    setError(null)
  }

  function onHoursTap(day: DayHours) {
    const closed = hoursRowClosed(day)
    const tappable = hoursRowTappable({
      closed,
      hasServices,
      mode,
    })
    const selected = hoursRowSelected({
      tappable,
      rowWeekday: day.weekday,
      preferredDate,
    })
    const next = applyHoursRowTap({
      tappable,
      selected,
      weekday: day.weekday,
      today: date,
      preferredTime,
    })
    if ('noop' in next) {
      return
    }
    if (chatting) {
      keepChatOpen.current = false
      setMode('idle')
      setNeedLogin(false)
      setNeedEmail(false)
      setNeedPhone(false)
      setError(null)
    }
    setPreferredDate(next.preferredDate)
    setPreferredTime(next.preferredTime)
  }

  function bookingInput(): CreateBookingInput | null {
    if (!id) {
      return null
    }
    if (chatting) {
      const chatInput = assistantBookingInput({
        salonId: id,
        serviceIds: chatSelected,
        workerChoice: chatWorker,
        preferredDate: chatDate,
        preferredTime: chatTime,
      })
      if (chatInput === null) {
        return null
      }
      return withIntakeToken(chatInput, intakeToken)
    }
    const input: CreateBookingInput = {
      salonId: id,
      serviceIds: selected,
      preferredDate,
      preferredTime,
    }
    const workerId = bookingWorkerId(workerChoice)
    if (workerId !== undefined) {
      input.workerId = workerId
    }
    return input
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const ready = chatting ? canSendChat : canSendPicker
    if (!id || !ready || busy) {
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

  async function afterAuth() {
    if (chatting && id && !isEmptyIntakeSnapshot(chatSnapshot) && !waiting) {
      lastSnapshot.current = chatSnapshot
      try {
        const result = await upsertIntake({
          variables: {
            input: {
              salonId: id,
              token: intakeToken,
              serviceIds: chatSnapshot.serviceIds,
              workerId: chatSnapshot.workerId,
              workerConfirmed: chatSnapshot.workerConfirmed,
              preferredDate: chatSnapshot.preferredDate === '' ? null : chatSnapshot.preferredDate,
              preferredTime: chatSnapshot.preferredTime === '' ? null : chatSnapshot.preferredTime,
            },
          },
        })
        const token = result.data?.upsertAssistantIntake.token
        if (typeof token === 'string') {
          writeIntakeToken(id, token)
          setIntakeToken(token)
        }
      } catch (err) {
        if (graphqlErrorCode(err) === 'INTAKE_TAKEN_OVER') {
          void refetchIntake()
          return
        }
        throw err
      }
    }
    if (waiting) {
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

  async function onPing() {
    if (!id || waiting || pinged) {
      return
    }
    try {
      const result = await pingIntake({
        variables: { salonId: id, token: intakeToken },
      })
      const token = result.data?.pingAssistantIntake.token
      if (typeof token === 'string') {
        writeIntakeToken(id, token)
        setIntakeToken(token)
      }
      setPinged(true)
    } catch (err) {
      if (graphqlErrorCode(err) === 'INTAKE_TAKEN_OVER') {
        void refetchIntake()
      }
    }
  }

  const catalog = (
    <>
      <section className={showBookingColumn ? undefined : 'mt-8'}>
        <h2 className="text-sm font-semibold text-ink">{t('salon.hours')}</h2>
        <p className="mt-2 text-sm text-muted">{t('salon.sendHint')}</p>
        <ul className="mt-3 space-y-2">
          {salon.hours.map((day) => {
            const closed = hoursRowClosed(day)
            const tappable = hoursRowTappable({
              closed,
              hasServices,
              mode,
            })
            const selectedRow = hoursRowSelected({
              tappable,
              rowWeekday: day.weekday,
              preferredDate,
            })
            const label = t(`weekday.${day.weekday}`)
            const line = hoursLine(day, t)
            const showRowPill = showDaySendPill({
              preferredDate,
              hasServices,
              chatting,
              sent,
              tappable,
            })
            if (tappable) {
              return (
                <li key={day.weekday}>
                  <button
                    type="button"
                    className={`flex w-full justify-between gap-4 px-2 py-1.5 text-left text-sm text-body hover:bg-surface-soft focus:bg-surface-soft ${selectedRow ? 'bg-surface-soft' : ''}`}
                    onClick={() => onHoursTap(day)}
                  >
                    <span>{label}</span>
                    <span className="text-right">{line}</span>
                  </button>
                  {showRowPill && selectedRow ? (
                    <div className="mt-2">
                      <button
                        type="button"
                        className={SALON_SEND_CLASS}
                        onClick={() => openIntake('picker')}
                      >
                        {t('salon.send')}
                      </button>
                    </div>
                  ) : null}
                </li>
              )
            }
            return (
              <li
                key={day.weekday}
                className={`flex justify-between gap-4 px-2 py-1.5 text-sm ${closed ? 'text-muted' : 'text-body'}`}
              >
                <span>{label}</span>
                <span className="text-right">{line}</span>
              </li>
            )
          })}
        </ul>
        {showChatCard ? (
          chatting ? (
            <div className={`${SALON_CHAT_CARD_CLASS} pointer-events-none`} aria-pressed="true">
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-muted">{t('assistant.nudge')}</span>
                <span className="block text-sm font-semibold text-ink">{t('assistant.ask')}</span>
              </span>
              <svg className="size-4 shrink-0 text-ink" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          ) : (
            <button
              type="button"
              className={`${SALON_CHAT_CARD_CLASS}${picking ? ' pointer-events-none' : ''}`}
              onClick={() => openIntake('chat')}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-muted">{t('assistant.nudge')}</span>
                <span className="block text-sm font-semibold text-ink">{t('assistant.ask')}</span>
              </span>
              <svg className="size-4 shrink-0 text-ink" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          )
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">{t('salon.services')}</h2>
        {salon.services.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t('salon.emptyServices')}</p>
        ) : (
          <div className="mt-3">
            <SalonServiceGroups
              categories={salon.serviceCategories}
              picking={false}
              selected={selected}
              toggle={toggle}
            />
          </div>
        )}
      </section>

    </>
  )

  return (
    <>
      <TopNav me={navMe} />
      <main className={`${GUEST_COLUMN_CLASS} py-8`}>
      <header className="flex items-start justify-between gap-4">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">
          {salon.name}
        </h1>
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
      {sent && <p className="mt-8 text-sm text-ink">{t('salon.success')}</p>}

      <dialog
        ref={pickerDialogRef}
        className={SALON_PICKER_DIALOG_CLASS}
        onCancel={(event) => {
          if (
            !dialogCancelShouldClose(
              document.activeElement instanceof HTMLInputElement ? document.activeElement.type : null,
            )
          ) {
            event.preventDefault()
            keepPickerOpen.current = true
          } else {
            keepPickerOpen.current = false
          }
        }}
        onClose={() => {
          if (keepPickerOpen.current) {
            keepPickerOpen.current = false
            queueMicrotask(() => pickerDialogRef.current?.showModal())
            return
          }
          if (mode === 'picker') {
            setMode('idle')
          }
        }}
        onClick={(event) => {
          if (event.target === pickerDialogRef.current) {
            keepPickerOpen.current = false
            setMode('idle')
          }
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
          <button
            type="button"
            className="text-sm text-body"
            onClick={() => {
              keepPickerOpen.current = false
              setMode('idle')
            }}
          >
            {t('salon.close')}
          </button>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
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
          {error && picking && <p className="text-sm text-busy-busy">{error}</p>}
          {!needLogin && !needEmail && !needPhone && (
            <button
              type="submit"
              disabled={!canSendPicker || busy}
              className={SALON_SEND_CLASS}
            >
              {t('salon.send')}
            </button>
          )}
        </form>
        {picking && needEmail && (
          <div className="mt-8">
            <EmailVerifyPanel onRetry={() => afterAuth()} />
          </div>
        )}
        {picking && needPhone && (
          <div className="mt-8">
            <PhoneOtpPanel onRetry={() => afterAuth()} />
          </div>
        )}
        {picking && needLogin && (
          <div className="mt-8">
            <p className={PLACE_HEADING_CLASS}>{t('auth.placeCustomer')}</p>
            <AuthShell onAuthenticated={() => afterAuth()} />
          </div>
        )}
      </dialog>
      <dialog
        ref={chatDialogRef}
        className={SALON_PICKER_DIALOG_CLASS}
        onCancel={(event) => {
          if (
            !dialogCancelShouldClose(
              document.activeElement instanceof HTMLInputElement ? document.activeElement.type : null,
            )
          ) {
            event.preventDefault()
            keepChatOpen.current = true
          } else {
            keepChatOpen.current = false
          }
        }}
        onClose={() => {
          if (keepChatOpen.current) {
            keepChatOpen.current = false
            queueMicrotask(() => chatDialogRef.current?.showModal())
            return
          }
          if (mode === 'chat') {
            setMode('idle')
          }
        }}
        onClick={(event) => {
          if (event.target === chatDialogRef.current) {
            keepChatOpen.current = false
            setMode('idle')
          }
        }}
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="text-sm text-body"
            onClick={() => {
              keepChatOpen.current = false
              setMode('idle')
            }}
          >
            {t('salon.close')}
          </button>
        </div>
        {id ? (
          <div className="flex min-h-0 flex-1 flex-col md:min-h-[70vh]">
            <AssistantIntake
              salonName={salon.name}
              address={salon.address}
              services={salon.services}
              workers={salon.workers}
              dayHours={hoursForDay}
              minDate={date}
              selected={chatSelected}
              onToggleService={(serviceId) =>
                setChatSelected((ids) =>
                  ids.includes(serviceId) ? ids.filter((sid) => sid !== serviceId) : [...ids, serviceId],
                )
              }
              workerChoice={chatWorker}
              onPickWorker={(workerId) => {
                setChatWorker(workerId)
                setChatWorkerConfirmed(true)
              }}
              workerConfirmed={chatWorkerConfirmed}
              preferredDate={chatDate}
              onDate={(value) => {
                const next = assistantDateChange(value)
                setChatDate(next.preferredDate)
                setChatTime(next.preferredTime)
                setChatOtherTime(next.otherTime)
              }}
              preferredTime={chatTime}
              onPickSuggestion={(value) => {
                setChatTime(value)
                setChatOtherTime(false)
              }}
              onNativeTime={setChatTime}
              dayClosed={dayClosed}
              dayBusy={salon.chatBusyLevel}
              suggestions={suggestions}
              showOtherTime={assistantShowOtherTime(dayClosed)}
              otherTime={chatOtherTime}
              onOtherTime={() => {
                setChatOtherTime(true)
                setChatTime('')
              }}
              error={error}
              busy={busy}
              waiting={waiting}
              unknownShown={unknownShown}
              pinged={pinged}
              onUnknown={() => setUnknownShown(true)}
              onPing={() => void onPing()}
              needLogin={needLogin}
              needEmail={needEmail}
              needPhone={needPhone}
              onSend={onSubmit}
              onAfterAuth={() => void afterAuth()}
            />
          </div>
        ) : null}
      </dialog>
      </main>
    </>
  )
}
