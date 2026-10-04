import { useMutation, useQuery } from '@apollo/client'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthShell } from '../components/AuthShell'
import { EmailVerifyPanel } from '../components/EmailVerifyPanel'
import { OwnerShell } from '../components/OwnerShell'
import { TopNav } from '../components/TopNav'
import { Alert, Spinner } from '../components/ui'
import { OwnerPageSkeleton, FormSkeleton } from '../components/Skeleton'
import {
  CHANGE_PASSWORD_MUTATION,
  ME_QUERY,
  UPDATE_OWNER_VIEW_MUTATION,
  UPDATE_CHAT_ENABLED_MUTATION,
  type MeData,
  type OwnerView,
} from '../graphql/auth'
import { IN_FLIGHT_INTAKE_COUNT_QUERY, type InFlightIntakeCountData } from '../graphql/intake'
import { graphqlErrorCode } from '../lib/booking'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { chatBadgeCount } from '../lib/intake'
import { useOwnerPush } from '../lib/push'

export function OwnerSettings() {
  const { t } = useTranslation()
  const { data, loading, refetch } = useQuery<MeData>(ME_QUERY)
  const [changePassword, { loading: saving }] = useMutation(CHANGE_PASSWORD_MUTATION)
  const [updateOwnerView, { loading: savingView }] = useMutation(UPDATE_OWNER_VIEW_MUTATION)
  const [updateChatEnabled] = useMutation(UPDATE_CHAT_ENABLED_MUTATION)
  const [viewError, setViewError] = useState(false)
  const [chatError, setChatError] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const navMe = loading ? null : (data?.me ?? null)
  const salons = data?.me?.salons ?? []
  const firstOwnedId = salons[0]?.id ?? ''
  const ownerReady = firstOwnedId !== '' && data?.me?.emailVerified === true
  useOwnerPush(ownerReady)
  const { data: countData } = useQuery<InFlightIntakeCountData>(IN_FLIGHT_INTAKE_COUNT_QUERY, {
    variables: { salonId: firstOwnedId },
    skip: !ownerReady,
    fetchPolicy: 'network-only',
  })
  const badge = chatBadgeCount(countData?.inFlightIntakeCount ?? 0)

  async function chooseChat(enabled: boolean) {
    if (data?.me?.chatEnabled === enabled) {
      return
    }
    setChatError(false)
    try {
      await updateChatEnabled({ variables: { enabled } })
    } catch {
      setChatError(true)
    }
  }

  async function chooseView(view: OwnerView) {
    if (savingView || data?.me?.ownerView === view) {
      return
    }
    setViewError(false)
    try {
      await updateOwnerView({ variables: { view } })
    } catch {
      setViewError(true)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (saving) {
      return
    }
    setError(null)
    setSaved(false)
    if (next !== confirm) {
      setError(t('owner.passwordMismatch'))
      return
    }
    try {
      await changePassword({ variables: { currentPassword: current, password: next } })
      setCurrent('')
      setNext('')
      setConfirm('')
      setSaved(true)
    } catch (err) {
      const code = graphqlErrorCode(err)
      if (code === 'INVALID_CURRENT_PASSWORD') {
        setError(t('owner.passwordError.INVALID_CURRENT_PASSWORD'))
      } else if (code === 'WEAK_PASSWORD') {
        setError(t('auth.gate.WEAK_PASSWORD'))
      } else {
        setError(t('salon.gate.fallback'))
      }
    }
  }

  if (loading) {
    return (
      <OwnerPageSkeleton>
        <FormSkeleton />
      </OwnerPageSkeleton>
    )
  }

  if (data?.me == null) {
    return (
      <div className="flex min-h-svh flex-col bg-page">
        <TopNav me={navMe} />
        <AuthShell place="panel" onAuthenticated={() => refetch()} />
      </div>
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
    return null
  }

  return (
    <>
      <OwnerShell
        personName={data.me.name}
        title={t('owner.settings')}
        salons={salons}
        salonId={firstOwnedId}
        firstOwnedId={firstOwnedId}
        badge={badge}
        active="settings"
      >
        <p className="text-sm text-body">{data.me.email}</p>
        <div className="mt-6 grid max-w-3xl gap-4">
          <section className="space-y-3 rounded-3xl bg-canvas p-5 md:p-6">
            <h2 className="micro-label text-muted">{t('owner.view')}</h2>
            <div role="radiogroup" aria-label={t('owner.view')} className="inline-flex rounded-full bg-surface-card p-1">
              {(['CALENDAR', 'KANBAN'] as const).map((view) => {
                const on = data.me?.ownerView === view
                return (
                  <button
                    key={view}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={savingView}
                    onClick={() => void chooseView(view)}
                    className={
                      on
                        ? 'h-10 rounded-full bg-ink px-5 text-sm font-semibold text-canvas'
                        : 'h-10 rounded-full px-5 text-sm text-body disabled:opacity-40'
                    }
                  >
                    {t(view === 'CALENDAR' ? 'owner.viewCalendar' : 'owner.viewKanban')}
                  </button>
                )
              })}
            </div>
            <p className="text-sm text-muted">{t('owner.viewHint')}</p>
            {viewError ? <Alert variant="error">{t('owner.viewError')}</Alert> : null}
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                role="switch"
                checked={data.me?.chatEnabled === true}
                onChange={() => void chooseChat(data.me?.chatEnabled !== true)}
              />
              {t('owner.chat')}
            </label>
            {chatError ? <Alert variant="error">{t('owner.chatError')}</Alert> : null}
          </section>
          <form className="space-y-4 rounded-3xl bg-canvas p-5 md:p-6" onSubmit={(e) => void onSubmit(e)}>
            <h2 className="micro-label text-muted">{t('owner.passwordTitle')}</h2>
            <label className="block text-sm text-body">
              {t('owner.passwordCurrent')}
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="field mt-1"
              />
            </label>
            <label className="block text-sm text-body">
              {t('owner.passwordNew')}
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                className="field mt-1"
              />
            </label>
            <label className="block text-sm text-body">
              {t('owner.passwordConfirm')}
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="field mt-1"
              />
            </label>
            {error ? <Alert variant="error">{error}</Alert> : null}
            {saved ? <Alert variant="success">{t('owner.passwordChanged')}</Alert> : null}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-canvas disabled:opacity-40 active:scale-[0.98] active:bg-[#242424]"
            >
              {saving ? <Spinner /> : null}
              {t('owner.save')}
            </button>
          </form>
        </div>
      </OwnerShell>
    </>
  )
}
