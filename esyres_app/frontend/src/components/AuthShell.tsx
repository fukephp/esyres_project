import { useMutation } from '@apollo/client'
import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  REQUEST_PASSWORD_RESET_MUTATION,
  RESET_PASSWORD_MUTATION,
} from '../graphql/auth'
import { graphqlErrorCode } from '../lib/booking'
import { PLACE_HEADING_CLASS } from '../lib/homepage'
import { Alert, Spinner } from './ui'

type Pane = 'login' | 'register' | 'forgot' | 'reset'

const PANE_ORDER: Record<Pane, number> = { login: 0, register: 1, forgot: 2, reset: 3 }

const SUBMIT_CLASS =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas disabled:opacity-40'
const TEXT_LINK_CLASS = 'text-sm text-body underline-offset-4 hover:underline'

function authMessage(code: string | null, t: (key: string) => string): string {
  if (code === 'EMAIL_TAKEN') {
    return t('auth.gate.EMAIL_TAKEN')
  }
  if (code === 'PHONE_TAKEN') {
    return t('auth.gate.PHONE_TAKEN')
  }
  if (code === 'WEAK_PASSWORD') {
    return t('auth.gate.WEAK_PASSWORD')
  }
  if (code === 'INVALID_EMAIL') {
    return t('auth.gate.INVALID_EMAIL')
  }
  if (code === 'INVALID_PHONE') {
    return t('auth.gate.INVALID_PHONE')
  }
  if (code === 'INVALID_CREDENTIALS') {
    return t('auth.gate.INVALID_CREDENTIALS')
  }
  if (code === 'INVALID_NAME') {
    return t('auth.gate.INVALID_NAME')
  }
  return t('auth.gate.fallback')
}

export function AuthShell({
  onAuthenticated,
  initialMode = 'login',
  variant = 'page',
  place = 'customer',
  reset,
}: {
  onAuthenticated: () => void | Promise<unknown>
  initialMode?: 'login' | 'register'
  variant?: 'page' | 'modal'
  place?: 'customer' | 'panel'
  reset?: { token: string; email: string }
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [login] = useMutation(LOGIN_MUTATION, { refetchQueries: ['Me'] })
  const [register] = useMutation(REGISTER_MUTATION, { refetchQueries: ['Me'] })
  const [requestReset] = useMutation(REQUEST_PASSWORD_RESET_MUTATION)
  const [resetPassword] = useMutation(RESET_PASSWORD_MUTATION, { refetchQueries: ['Me'] })
  const [pane, setPane] = useState<Pane>(reset ? 'reset' : initialMode)
  const [direction, setDirection] = useState<'forward' | 'back' | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState(reset?.email ?? '')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [resetInvalid, setResetInvalid] = useState(false)
  const [busy, setBusy] = useState(false)
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (el == null || typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function go(next: Pane) {
    if (next === pane) {
      return
    }
    setDirection(PANE_ORDER[next] > PANE_ORDER[pane] ? 'forward' : 'back')
    setPane(next)
    setPassword('')
    setError(null)
    setNotice(null)
    setResetInvalid(false)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      if (pane === 'forgot') {
        await requestReset({ variables: { email: email.trim() } })
        setNotice(t('auth.forgotSent'))
        return
      }
      if (pane === 'reset' && reset) {
        try {
          await resetPassword({ variables: { email: reset.email, token: reset.token, password } })
        } catch (err) {
          if (graphqlErrorCode(err) === 'INVALID_RESET_TOKEN') {
            setResetInvalid(true)
            return
          }
          throw err
        }
        go('login')
        setEmail(reset.email)
        setNotice(t('auth.resetDone'))
        return
      }
      if (pane === 'register') {
        await register({
          variables: {
            name: name.trim(),
            email,
            password,
            phone: phone.trim() === '' ? null : phone.trim(),
          },
        })
      } else {
        const result = await login({ variables: { email, password } })
        const loggedIn = result.data?.login as { isAdmin?: boolean } | undefined
        if (loggedIn?.isAdmin) {
          navigate('/admin/dashboard', { replace: true })
          return
        }
      }
      await onAuthenticated()
    } catch (err) {
      setError(authMessage(graphqlErrorCode(err), t))
    } finally {
      setBusy(false)
    }
  }

  const tabs = pane === 'login' || pane === 'register'
  const submitLabel =
    pane === 'register'
      ? t('auth.submitRegister')
      : pane === 'forgot'
        ? t('auth.submitForgot')
        : pane === 'reset'
          ? t('auth.submitReset')
          : t('auth.submitLogin')

  const box = (
    <div
      style={{ height }}
      className="-m-1 overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none"
    >
      <div ref={innerRef} className="p-1">
        {tabs ? (
          <div className={`mb-5 flex ${variant === 'page' ? 'justify-center' : ''}`}>
            <div className="relative inline-grid grid-cols-2 text-sm">
              <span
                aria-hidden="true"
                className={`absolute inset-y-0 left-0 w-1/2 rounded-full bg-ink transition-transform duration-200 ease-out motion-reduce:transition-none ${
                  pane === 'register' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              <button
                type="button"
                aria-pressed={pane === 'login'}
                className={`relative rounded-full px-4 py-2 transition-colors duration-200 motion-reduce:transition-none ${
                  pane === 'login' ? 'font-semibold text-canvas' : 'text-body'
                }`}
                onClick={() => go('login')}
              >
                {t('auth.login')}
              </button>
              <button
                type="button"
                aria-pressed={pane === 'register'}
                className={`relative rounded-full px-4 py-2 transition-colors duration-200 motion-reduce:transition-none ${
                  pane === 'register' ? 'font-semibold text-canvas' : 'text-body'
                }`}
                onClick={() => go('register')}
              >
                {t('auth.register')}
              </button>
            </div>
          </div>
        ) : null}
        <form
          key={pane}
          className={`space-y-4 ${direction === 'forward' ? 'auth-pane-forward' : direction === 'back' ? 'auth-pane-back' : ''}`}
          onSubmit={onSubmit}
        >
          {pane === 'register' && (
            <label className="block text-sm text-body">
              {t('auth.name')}
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field mt-1"
              />
            </label>
          )}
          {pane !== 'reset' && (
            <label className="block text-sm text-body">
              {t('auth.email')}
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field mt-1"
              />
            </label>
          )}
          {(pane === 'login' || pane === 'register') && (
            <div>
              <PasswordField
                label={t('auth.password')}
                value={password}
                onChange={setPassword}
                minLength={pane === 'register' ? 8 : undefined}
                autoComplete={pane === 'register' ? 'new-password' : 'current-password'}
              />
              {pane === 'login' ? (
                <button type="button" className={`mt-2 ${TEXT_LINK_CLASS}`} onClick={() => go('forgot')}>
                  {t('auth.forgot')}
                </button>
              ) : null}
            </div>
          )}
          {pane === 'register' && (
            <label className="block text-sm text-body">
              {t('auth.phone')}
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="field mt-1"
              />
            </label>
          )}
          {pane === 'reset' && !resetInvalid && (
            <PasswordField
              label={t('auth.newPassword')}
              value={password}
              onChange={setPassword}
              minLength={8}
              autoComplete="new-password"
            />
          )}
          {notice && <Alert variant="success">{notice}</Alert>}
          {error && <Alert variant="error">{error}</Alert>}
          {resetInvalid ? (
            <>
              <Alert variant="error">{t('auth.resetInvalid')}</Alert>
              <button type="button" className={SUBMIT_CLASS} onClick={() => go('forgot')}>
                {t('auth.resetAgain')}
              </button>
            </>
          ) : (
            <button type="submit" disabled={busy} className={SUBMIT_CLASS}>
              {busy ? <Spinner /> : null}
              {submitLabel}
            </button>
          )}
          {pane === 'forgot' ? (
            <div className="text-center">
              <button type="button" className={TEXT_LINK_CLASS} onClick={() => go('login')}>
                {t('auth.backToLogin')}
              </button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  )

  if (variant === 'modal') {
    return box
  }

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <div className="w-full max-w-[400px] rounded-3xl border border-hairline bg-canvas p-6 md:p-8">
        <h1 className={`${PLACE_HEADING_CLASS} text-center`}>
          {t(place === 'panel' ? 'auth.placePanel' : 'auth.placeCustomer')}
        </h1>
        <div className="mt-6">{box}</div>
      </div>
    </main>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  minLength,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  minLength?: number
  autoComplete: string
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  return (
    <label className="block text-sm text-body">
      {label}
      <span className="relative mt-1 block">
        <input
          type={visible ? 'text' : 'password'}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field"
          style={{ paddingRight: '2.75rem' }}
        />
        <button
          type="button"
          aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted"
          onClick={() => setVisible((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {visible ? (
              <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a13 13 0 0 1-3.2 4.3M6.6 6.6C4.4 8 2.8 10.2 2 12c1 2.5 5 7 10 7 1.7 0 3.3-.5 4.6-1.3" />
            ) : (
              <>
                <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </span>
    </label>
  )
}
