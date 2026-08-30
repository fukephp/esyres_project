import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const [busy, setBusy] = useState(false)

  async function onResend() {
    if (busy) {
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      await resend()
      setMsg(t('verify.resent'))
    } catch (err) {
      setMsg(resendMessage(graphqlErrorCode(err), t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-body">{t('verify.checkEmail')}</p>
      {msg && <p className="text-sm text-body">{msg}</p>}
      <button
        type="button"
        disabled={busy}
        className="text-sm font-medium text-ink disabled:opacity-40"
        onClick={() => void onResend()}
      >
        {t('verify.resend')}
      </button>
      {onRetry ? (
        <button
          type="button"
          disabled={busy}
          className="block w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas disabled:opacity-40"
          onClick={() => void onRetry()}
        >
          {t('verify.retry')}
        </button>
      ) : null}
    </div>
  )
}
