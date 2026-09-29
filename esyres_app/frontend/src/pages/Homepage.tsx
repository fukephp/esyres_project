import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { TopNav } from '../components/TopNav'
import { PopularSkeleton } from '../components/Skeleton'
import { ME_QUERY, type MeData } from '../graphql/auth'
import { POPULAR_IN_SARAJEVO_QUERY, type PopularInSarajevoData } from '../graphql/discovery'
import { sarajevoToday } from '../lib/format'
import {
  DISCOVERY_HREF,
  GUEST_COLUMN_CLASS,
  PLACE_HEADING_CLASS,
  homepageChrome,
  nextHomepageAuth,
} from '../lib/homepage'

const SECTION_TITLE_CLASS = 'font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl'
const PILL_CLASS =
  'inline-flex h-11 w-fit items-center rounded-full bg-ink px-6 text-sm font-semibold text-canvas active:scale-[0.98] active:bg-[#242424]'

export function Homepage() {
  const { t } = useTranslation()
  const { data } = useQuery<MeData>(ME_QUERY)
  const [authOpen, setAuthOpen] = useState<'login' | 'register' | null>(null)
  const { data: popular, loading: popularLoading } = useQuery<PopularInSarajevoData>(POPULAR_IN_SARAJEVO_QUERY, {
    variables: { date: sarajevoToday(), category: null, name: null },
    skip: authOpen !== null,
  })
  const panelHref = homepageChrome(data?.me ?? null).panel.href
  const salons = (popular?.popularInSarajevo ?? []).slice(0, 4)

  return (
    <div className="homepage flex min-h-svh flex-col bg-page">
      <TopNav
        me={data?.me ?? null}
        onLogin={() => setAuthOpen((current) => nextHomepageAuth(current, 'login'))}
        onRegister={() => setAuthOpen((current) => nextHomepageAuth(current, 'register'))}
      />
      {authOpen ? (
        <div className={`${GUEST_COLUMN_CLASS} py-8 md:py-12`}>
          <h1 className={PLACE_HEADING_CLASS}>{t('auth.placeCustomer')}</h1>
          <div className="mt-8 max-w-sm">
            <AuthShell key={authOpen} initialMode={authOpen} onAuthenticated={() => setAuthOpen(null)} />
          </div>
        </div>
      ) : (
        <>
          <main className={`${GUEST_COLUMN_CLASS} flex-1 pb-16`}>
            <section className="grid items-center gap-10 pt-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:pt-16">
              <div>
                <h1 className="pitch-display text-[36px] leading-[1.08] text-ink md:text-5xl lg:text-6xl">{t('pitch.h1')}</h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-body md:text-lg">{t('pitch.support')}</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link to={DISCOVERY_HREF} className={PILL_CLASS}>
                    {t('pitch.cta')}
                  </Link>
                  <Link to={panelHref} className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
                    {t('home.getPanel')} →
                  </Link>
                </div>
              </div>
              <HeroMock />
            </section>

            <section className="mt-20">
              <h2 className={SECTION_TITLE_CLASS}>{t('home.howTitle')}</h2>
              <ol className="mt-6 grid gap-4 md:grid-cols-3">
                {(
                  [
                    ['bg-pastel-pink', 'home.how1Title', 'home.how1Body'],
                    ['bg-pastel-yellow', 'home.how2Title', 'home.how2Body'],
                    ['bg-pastel-blue', 'home.how3Title', 'home.how3Body'],
                  ] as const
                ).map(([tone, title, body], i) => (
                  <li key={title} className={`rounded-3xl p-6 ${tone}`}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-sm font-semibold text-ink">
                      {i + 1}
                    </span>
                    <h3 className="mt-6 text-lg font-semibold text-ink">{t(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/80">{t(body)}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-16 grid gap-4 md:grid-cols-2">
              <AudienceCard
                tone="bg-pastel-pink"
                title={t('home.guestsTitle')}
                lines={[t('home.guestsLine1'), t('home.guestsLine2'), t('home.guestsLine3')]}
                cta={t('pitch.cta')}
                to={DISCOVERY_HREF}
              />
              <AudienceCard
                tone="bg-pastel-blue"
                title={t('home.salonsTitle')}
                lines={[t('home.salonsLine1'), t('home.salonsLine2'), t('home.salonsLine3')]}
                cta={t('home.salonsCta')}
                to={panelHref}
              />
            </section>

            {popularLoading ? (
              <PopularSkeleton />
            ) : salons.length > 0 ? (
              <section className="mt-16">
                <div className="flex items-end justify-between gap-4">
                  <h2 className={SECTION_TITLE_CLASS}>{t('home.popularTitle')}</h2>
                  <Link to={DISCOVERY_HREF} className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
                    {t('home.showAll')} →
                  </Link>
                </div>
                <ul className="-mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
                  {salons.map((salon) => (
                    <li key={salon.id} className="w-[70%] shrink-0 snap-start md:w-auto">
                      <Link to={`/salon/${salon.id}`} className="block h-full rounded-3xl bg-canvas p-5 active:scale-[0.99]">
                        <span className="block text-base font-semibold text-ink">{salon.name}</span>
                        {salon.address ? <span className="mt-1 block text-sm text-muted">{salon.address}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-16 max-w-2xl">
              <h2 className={SECTION_TITLE_CLASS}>{t('home.faqTitle')}</h2>
              <div className="mt-6 space-y-3">
                {(
                  [
                    ['home.faq1Q', 'home.faq1A'],
                    ['home.faq2Q', 'home.faq2A'],
                    ['home.faq3Q', 'home.faq3A'],
                  ] as const
                ).map(([q, a]) => (
                  <details key={q} className="group rounded-2xl bg-canvas px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                      {t(q)}
                      <span aria-hidden="true" className="text-xl leading-none transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-body">{t(a)}</p>
                  </details>
                ))}
              </div>
            </section>
          </main>
          <footer className="bg-surface-dark text-on-dark">
            <div className={`${GUEST_COLUMN_CLASS} flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between`}>
              <div className="text-sm">
                <p className="pitch-display text-lg">{t('pitch.brand')}</p>
                <p className="mt-1 text-on-dark-soft">
                  {t('home.footerCity')} · {t('home.footerLine')}
                </p>
              </div>
              <nav className="flex gap-6 text-sm font-semibold">
                <Link to={DISCOVERY_HREF}>{t('home.footerSalons')}</Link>
                <Link to={panelHref}>{t('home.panel')}</Link>
              </nav>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}

function HeroMock() {
  const { t } = useTranslation()

  return (
    <div aria-hidden="true" className="rounded-3xl bg-surface-dark p-4 md:p-6">
      <div className="rounded-2xl bg-canvas p-4 md:p-5">
        <p className="micro-label text-muted">{t('home.mockTitle')}</p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-pastel-pink p-4">
            <span className="text-sm font-semibold text-ink">{t('home.mockRow1')}</span>
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-canvas">{t('home.mockAccept')}</span>
          </div>
          <div className="rounded-2xl bg-pastel-yellow p-4 text-sm font-semibold text-ink">{t('home.mockRow2')}</div>
          <div className="rounded-2xl bg-pastel-blue p-4 text-sm font-semibold text-ink">{t('home.mockRow3')}</div>
        </div>
      </div>
    </div>
  )
}

function AudienceCard({
  tone,
  title,
  lines,
  cta,
  to,
}: {
  tone: string
  title: string
  lines: string[]
  cta: string
  to: string
}) {
  return (
    <div className={`flex flex-col rounded-3xl p-6 md:p-8 ${tone}`}>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-ink/80">
        {lines.map((line) => (
          <li key={line}>— {line}</li>
        ))}
      </ul>
      <Link to={to} className={`${PILL_CLASS} mt-8`}>
        {cta}
      </Link>
    </div>
  )
}
