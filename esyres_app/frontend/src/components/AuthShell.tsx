import { useMutation } from '@apollo/client'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/auth'
import { graphqlErrorCode } from '../lib/booking'

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
  if (code === 'INVALID_CREDENTIALS') {
    return t('auth.gate.INVALID_CREDENTIALS')
  }
  return t('auth.gate.fallback')
}

export function AuthShell({ onAuthenticated }: { onAuthenticated: () => void | Promise<unknown> }) {
  const { t } = useTranslation()
  const [login] = useMutation(LOGIN_MUTATION, { refetchQueries: ['Me'] })
  const [register] = useMutation(REGISTER_MUTATION, { refetchQueries: ['Me'] })
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      if (mode === 'register') {
        await register({
          variables: { email, password, phone: phone.trim() === '' ? null : phone.trim() },
        })
      } else {
        await login({ variables: { email, password } })
      }
      await onAuthenticated()
    } catch (err) {
      setError(authMessage(graphqlErrorCode(err), t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="flex gap-4 text-sm">
        <button
          type="button"
          className={mode === 'login' ? 'font-semibold text-ink' : 'text-body'}
          onClick={() => setMode('login')}
        >
          {t('auth.login')}
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'font-semibold text-ink' : 'text-body'}
          onClick={() => setMode('register')}
        >
          {t('auth.register')}
        </button>
      </div>
      <label className="block text-sm text-body">
        {t('auth.email')}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
        />
      </label>
      <label className="block text-sm text-body">
        {t('auth.password')}
        <input
          type="password"
          required
          minLength={mode === 'register' ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
        />
      </label>
      {mode === 'register' && (
        <label className="block text-sm text-body">
          {t('auth.phone')}
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
          />
        </label>
      )}
      {error && <p className="text-sm text-busy-busy">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas disabled:opacity-40"
      >
        {mode === 'register' ? t('auth.submitRegister') : t('auth.submitLogin')}
      </button>
    </form>
  )
}
