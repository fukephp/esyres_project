import { useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerNav } from '../components/OwnerNav'
import { ME_QUERY, type MeData } from '../graphql/auth'
import {
  IN_FLIGHT_INTAKE_COUNT_QUERY,
  IN_FLIGHT_INTAKES_QUERY,
  RELEASE_INTAKE_MUTATION,
  TAKE_OVER_INTAKE_MUTATION,
  UPDATE_SALON_DND_MUTATION,
  type InFlightIntakeCountData,
  type InFlightIntakeRow,
  type InFlightIntakesData,
} from '../graphql/intake'
import { OWNER_SALON_QUERY, type OwnerSalonData } from '../graphql/pending'
import { formatSarajevoDateTime } from '../lib/format'
import {
  chatBadgeCount,
  intakePingMark,
  intakeProgressLine,
  intakeSnapshotFromRow,
  intakeStepFromSnapshot,
  takeoverRowChrome,
} from '../lib/intake'
import { ownerChatSearchParams, ownerSalonFromSearch } from '../lib/owner'
import { useOwnerPush } from '../lib/push'

export function OwnerChats() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const salons = data?.me?.salons ?? []
  const salonId = ownerSalonFromSearch(params.get('salon'), salons)
  const salon = salons.find((row) => row.id === salonId) ?? null
  const ownerReady = salon !== null && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const { data: countData, refetch: refetchCount } = useQuery<InFlightIntakeCountData>(IN_FLIGHT_INTAKE_COUNT_QUERY, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const { data: listData, loading: listLoading, refetch: refetchList } = useQuery<InFlightIntakesData>(IN_FLIGHT_INTAKES_QUERY, {
    variables: { salonId: salon?.id ?? '' },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const { data: board, refetch: refetchBoard } = useQuery<OwnerSalonData>(OWNER_SALON_QUERY, {
    variables: { id: salon?.id ?? '' },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const [takeOver] = useMutation(TAKE_OVER_INTAKE_MUTATION)
  const [release] = useMutation(RELEASE_INTAKE_MUTATION)
  const [setDnd] = useMutation(UPDATE_SALON_DND_MUTATION)
  const badge = chatBadgeCount(countData?.inFlightIntakeCount ?? 0)
  const firstOwnedId = salons[0]?.id ?? ''
  const takeoverAllowed = board?.salon?.takeoverAllowed === true
  const dnd = board?.salon?.dnd === true

  function refreshChats() {
    void refetchList()
    void refetchCount()
    void refetchBoard()
  }

  function onSalon(id: string) {
    setParams(ownerChatSearchParams(id, firstOwnedId))
  }

  if (loading) {
    return (
      <main className="px-5 py-8 text-body">
        <p>{t('salon.loading')}</p>
      </main>
    )
  }

  if (data?.me == null) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.chat')}</h1>
        <div className="mt-8">
          <AuthShell allowRegister={false} onAuthenticated={() => refetch()} />
        </div>
      </main>
    )
  }

  if (!data.me.emailVerified) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.chat')}</h1>
        <div className="mt-8">
          <EmailVerifyPanel />
        </div>
      </main>
    )
  }

  if (salon === null) {
    return (
      <main className="mx-auto max-w-md px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink">{t('owner.chat')}</h1>
        <p className="mt-8 text-sm text-body">{t('owner.notOwner')}</p>
      </main>
    )
  }

  const rows = listData?.inFlightIntakes ?? []
  const services = board?.salon?.services ?? []
  const workerCount = board?.salon?.workers.length ?? 0

  return (
    <div className="min-h-svh md:flex">
      <aside className="hidden bg-surface-dark px-5 py-8 text-on-dark md:flex md:w-56 md:shrink-0 md:flex-col">
        <Switcher salons={salons} salon={salon} onSalon={onSalon} />
        <OwnerNav
          salonId={salon.id}
          firstOwnedId={firstOwnedId}
          badge={badge}
          active="chats"
          tone="dark"
        />
      </aside>
      <main className="flex-1 px-5 py-8">
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-ink md:hidden">{t('owner.chat')}</h1>
        <div className="md:hidden">
          <Switcher salons={salons} salon={salon} onSalon={onSalon} />
          <OwnerNav
            salonId={salon.id}
            firstOwnedId={firstOwnedId}
            badge={badge}
            active="chats"
            tone="light"
          />
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm text-body">
          <input
            type="checkbox"
            checked={dnd}
            onChange={(e) => {
              void setDnd({ variables: { salonId: salon.id, dnd: e.target.checked } }).then(refreshChats)
            }}
          />
          {t('owner.dnd')}
        </label>
        {listLoading ? (
          <p className="mt-8 text-sm text-body">{t('salon.loading')}</p>
        ) : rows.length === 0 ? (
          <p className="mt-8 text-sm text-body">{t('owner.chatsEmpty')}</p>
        ) : (
          <ul className="mt-8 max-w-xl space-y-3">
            {rows.map((row) => (
              <IntakeRow
                key={row.id}
                row={row}
                services={services}
                workerCount={workerCount}
                takeoverAllowed={takeoverAllowed}
                onTakeOver={() => void takeOver({ variables: { id: row.id } }).then(refreshChats)}
                onRelease={() => void release({ variables: { id: row.id } }).then(refreshChats)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

function Switcher({
  salons,
  salon,
  onSalon,
}: {
  salons: { id: string; name: string }[]
  salon: { id: string; name: string }
  onSalon: (id: string) => void
}) {
  const { t } = useTranslation()
  if (salons.length > 1) {
    return (
      <label className="block text-sm">
        {t('owner.salon')}
        <select
          value={salon.id}
          onChange={(e) => onSalon(e.target.value)}
          className="mt-1 w-full rounded-md border border-hairline bg-canvas px-2 py-1.5 text-sm text-ink md:border-white/20 md:bg-surface-dark md:text-on-dark"
        >
          {salons.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return <p className="text-sm font-semibold">{salon.name}</p>
}

function IntakeRow({
  row,
  services,
  workerCount,
  takeoverAllowed,
  onTakeOver,
  onRelease,
}: {
  row: InFlightIntakeRow
  services: { id: string; name: string }[]
  workerCount: number
  takeoverAllowed: boolean
  onTakeOver: () => void
  onRelease: () => void
}) {
  const { t } = useTranslation()
  const snapshot = intakeSnapshotFromRow(row)
  const names = services.filter((service) => row.serviceIds.includes(service.id)).map((service) => service.name)
  const progress = intakeProgressLine(names, intakeStepFromSnapshot(snapshot, workerCount))
  const line = progress.type === 'services' ? progress.text : t(`owner.chatStep.${progress.step}`)
  const chrome = takeoverRowChrome({ takeoverAllowed, takenOver: row.takenOver })

  return (
    <li className="rounded-lg border border-hairline bg-canvas px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold text-ink">{row.customerName}</p>
        <p className="text-xs text-muted">{formatSarajevoDateTime(row.updatedAt)}</p>
      </div>
      <p className="mt-1 text-sm text-body">{line}</p>
      {intakePingMark(row.pinged) && <p className="mt-1 text-sm font-medium text-ink">{t('owner.ping')}</p>}
      {chrome === 'takeover' && (
        <button type="button" className="mt-2 text-sm font-medium text-ink underline underline-offset-4" onClick={onTakeOver}>
          {t('owner.takeOver')}
        </button>
      )}
      {chrome === 'release' && (
        <button type="button" className="mt-2 text-sm font-medium text-ink underline underline-offset-4" onClick={onRelease}>
          {t('owner.releaseTakeOver')}
        </button>
      )}
    </li>
  )
}
