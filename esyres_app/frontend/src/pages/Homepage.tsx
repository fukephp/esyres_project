import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { LOGOUT_MUTATION, ME_QUERY, type MeData } from '../graphql/auth'
import { CREATE_SALON_HREF, DISCOVERY_HREF, homepageChrome } from '../lib/homepage'

export function Homepage() {
  const { t } = useTranslation()
  const { data } = useQuery<MeData>(ME_QUERY)
  const [logout] = useMutation(LOGOUT_MUTATION, { refetchQueries: ['Me'] })
  const [authOpen, setAuthOpen] = useState<'login' | 'register' | null>(null)
  const chrome = homepageChrome(data?.me ?? null)

  return (
    <div className="homepage mx-auto flex min-h-svh max-w-3xl flex-col px-5 py-8 md:px-16 md:py-12">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="pitch-display flex items-center gap-2 text-lg text-ink">
          <img src="/esyres-mark.svg" width={24} height={24} alt="" aria-hidden="true" />
          {t('pitch.brand')}
        </p>
        <nav className="ml-auto flex flex-wrap items-center gap-4 text-sm">
          {chrome.kind === 'guest' ? (
            <>
              <button type="button" className="text-body" onClick={() => setAuthOpen('login')}>
                {t('auth.login')}
              </button>
              <button type="button" className="text-body" onClick={() => setAuthOpen('register')}>
                {t('auth.register')}
              </button>
            </>
          ) : (
            <>
              <span className="text-body">{chrome.displayName}</span>
              <button type="button" className="text-body" onClick={() => void logout()}>
                {t('home.logout')}
              </button>
            </>
          )}
          <Link to={CREATE_SALON_HREF} className="text-body">
            {t('home.getPanel')}
          </Link>
        </nav>
      </header>
      {authOpen ? (
        <div className="mt-8 max-w-sm">
          <AuthShell key={authOpen} initialMode={authOpen} onAuthenticated={() => setAuthOpen(null)} />
        </div>
      ) : null}
      <main>
        <h1 className="pitch-display mt-10 text-[32px] leading-[1.15] text-ink md:mt-16 md:text-5xl lg:text-6xl">
          {t('pitch.h1')}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-6 text-body md:text-lg">{t('pitch.support')}</p>
        <ol className="mt-8 max-w-xl list-decimal space-y-3 pl-5 text-base leading-6 text-body">
          <li>{t('pitch.step1')}</li>
          <li>{t('pitch.step2')}</li>
          <li>{t('pitch.step3')}</li>
        </ol>
        <Link
          to={DISCOVERY_HREF}
          className="mt-10 inline-flex h-10 w-fit items-center rounded-md bg-ink px-5 text-sm font-semibold text-canvas active:bg-[#242424]"
        >
          {t('pitch.cta')}
        </Link>
      </main>
      <footer className="mt-auto pt-16 text-sm text-muted">
        <p>{t('home.footerCity')}</p>
        <p>{t('home.footerLine')}</p>
      </footer>
    </div>
  )
}
