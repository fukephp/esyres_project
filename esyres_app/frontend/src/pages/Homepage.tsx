import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { TopNav } from '../components/TopNav'
import { ME_QUERY, type MeData } from '../graphql/auth'
import {
  DISCOVERY_HREF,
  GUEST_COLUMN_CLASS,
  PLACE_HEADING_CLASS,
  nextHomepageAuth,
} from '../lib/homepage'

export function Homepage() {
  const { t } = useTranslation()
  const { data } = useQuery<MeData>(ME_QUERY)
  const [authOpen, setAuthOpen] = useState<'login' | 'register' | null>(null)

  return (
    <div className="homepage flex min-h-svh flex-col">
      <TopNav
        me={data?.me ?? null}
        onLogin={() => setAuthOpen((current) => nextHomepageAuth(current, 'login'))}
        onRegister={() => setAuthOpen((current) => nextHomepageAuth(current, 'register'))}
      />
      <div className={`${GUEST_COLUMN_CLASS} flex flex-1 flex-col py-8 md:py-12`}>
        {authOpen ? (
          <>
            <h1 className={PLACE_HEADING_CLASS}>{t('auth.placeCustomer')}</h1>
            <div className="mt-8 max-w-sm">
              <AuthShell key={authOpen} initialMode={authOpen} onAuthenticated={() => setAuthOpen(null)} />
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
