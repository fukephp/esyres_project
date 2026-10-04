import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from './ui'
import { RESEND_VERIFICATION_EMAIL } from '../graphql/auth'
import { graphqlErrorCode } from '../lib/booking'

function resendMessage(code: string | null, t: (key: string) => string): string {
  if (code === 'EMAIL_ALREADY_VERIFIED') {
    return t('verify.EMAIL_ALREADY_VERIFIED')
  }
  if (code === 'TOO_MANY_ATTEMPTS') {
    return t('verify.TOO_MANY_ATTEMPTS')
  }
  if (code === 'UNAUTHENTICATED') {
    return t('verify.UNAUTHENTICATED')
  }
  return t('verify.resendFailed')
}

export function EmailVerifyPanel({
  onRetry,
}: {
  onRetry?: () => void | Promise<unknown>
}) {
  const { t } = useTranslation()
  const [resend] = useMutation(RESEND_VERIFICATION_EMAIL)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState<null | 'resend' | 'retry'>(null)

  async function onResend() {
    if (busy !== null) {
      return
    }
    setBusy('resend')
    setMsg(null)
    try {
      await resend()
      setMsg(t('verify.resent'))
    } catch (err) {
      setMsg(resendMessage(graphqlErrorCode(err), t))
    } finally {
      setBusy(null)
    }
  }

  async function onRetryClick() {
    if (busy !== null || onRetry === undefined) {
      return
    }
    setBusy('retry')
    try {
      await onRetry()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-body">{t('verify.checkEmail')}</p>
      {msg && <p className="text-sm text-body">{msg}</p>}
      <button
        type="button"
        disabled={busy !== null}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink disabled:opacity-40"
        onClick={() => void onResend()}
      >
        {busy === 'resend' ? <Spinner /> : null}
        {t('verify.resend')}
      </button>
      {onRetry ? (
        <button
          type="button"
          disabled={busy !== null}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas disabled:opacity-40"
          onClick={() => void onRetryClick()}
        >
          {busy === 'retry' ? <Spinner /> : null}
          {t('verify.retry')}
        </button>
      ) : null}
    </div>
  )
}
