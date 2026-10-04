import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from './ui'
import { ME_QUERY, REQUEST_PHONE_OTP, VERIFY_PHONE_OTP, type MeData } from '../graphql/auth'
import { graphqlErrorCode } from '../lib/booking'

function otpMessage(code: string | null, t: (key: string) => string): string {
  if (code === 'INVALID_OTP') {
    return t('otp.INVALID_OTP')
  }
  if (code === 'TOO_MANY_ATTEMPTS') {
    return t('otp.TOO_MANY_ATTEMPTS')
  }
  if (code === 'INVALID_PHONE') {
    return t('otp.INVALID_PHONE')
  }
  if (code === 'PHONE_TAKEN') {
    return t('otp.PHONE_TAKEN')
  }
  if (code === 'PHONE_ALREADY_VERIFIED') {
    return t('otp.PHONE_ALREADY_VERIFIED')
  }
  if (code === 'UNAUTHENTICATED') {
    return t('otp.UNAUTHENTICATED')
  }
  return t('otp.fallback')
}

export function PhoneOtpPanel({
  onRetry,
}: {
  onRetry?: () => void | Promise<unknown>
}) {
  const { t } = useTranslation()
  const { data } = useQuery<MeData>(ME_QUERY)
  const [requestOtp] = useMutation(REQUEST_PHONE_OTP, { refetchQueries: ['Me'] })
  const [verifyOtp] = useMutation(VERIFY_PHONE_OTP, { refetchQueries: ['Me'] })
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState<null | 'send' | 'verify'>(null)

  useEffect(() => {
    const stored = data?.me?.phone
    if (stored) {
      setPhone(stored)
    }
  }, [data?.me?.phone])

  async function onSend(e: FormEvent) {
    e.preventDefault()
    if (busy !== null || phone.trim() === '') {
      return
    }
    setBusy('send')
    setMsg(null)
    try {
      await requestOtp({ variables: { phone: phone.trim() } })
      setMsg(t('otp.sent'))
    } catch (err) {
      setMsg(otpMessage(graphqlErrorCode(err), t))
    } finally {
      setBusy(null)
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault()
    if (busy !== null || code.trim() === '') {
      return
    }
    setBusy('verify')
    setMsg(null)
    try {
      await verifyOtp({ variables: { code: code.trim() } })
      if (onRetry) {
        await onRetry()
      }
    } catch (err) {
      setMsg(otpMessage(graphqlErrorCode(err), t))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-body">{t('otp.prompt')}</p>
      {msg && <p className="text-sm text-body">{msg}</p>}
      <form className="space-y-3" onSubmit={onSend}>
        <label className="block text-sm text-body">
          {t('otp.phone')}
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
          />
        </label>
        <button
          type="submit"
          disabled={busy !== null}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink disabled:opacity-40"
        >
          {busy === 'send' ? <Spinner /> : null}
          {t('otp.send')}
        </button>
      </form>
      <form className="space-y-3" onSubmit={onVerify}>
        <label className="block text-sm text-body">
          {t('otp.code')}
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full border border-hairline bg-canvas px-3 py-2 text-ink"
          />
        </label>
        {onRetry ? (
          <button
            type="submit"
            disabled={busy !== null}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas disabled:opacity-40"
          >
            {busy === 'verify' ? <Spinner /> : null}
            {t('otp.verify')}
          </button>
        ) : (
          <button
            type="submit"
            disabled={busy !== null}
            className="inline-flex items-center gap-2 text-sm font-medium text-ink disabled:opacity-40"
          >
            {busy === 'verify' ? <Spinner /> : null}
            {t('otp.verify')}
          </button>
        )}
      </form>
    </div>
  )
}
