import { useMutation } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { Spinner } from './ui'
import { LOGOUT_MUTATION } from '../graphql/auth'
import { BOOKINGS_HREF, GUEST_COLUMN_CLASS, isOwnerPath, PROFILE_HREF, topNavChrome, type TopNavMe } from '../lib/homepage'

const linkClass = 'text-sm text-body'
const panelClass =
  'inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-canvas active:bg-[#242424]'
const logoutClass =
  'inline-flex h-10 items-center rounded-full bg-error-strong px-5 text-sm font-semibold text-canvas active:bg-error-strong-active disabled:opacity-40'

export function TopNav({
  me = null,
  onLogin,
  onRegister,
}: {
  me?: TopNavMe
  onLogin?: () => void
  onRegister?: () => void
}) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [logout, { loading: loggingOut }] = useMutation(LOGOUT_MUTATION, { refetchQueries: ['Me'] })
  const chrome = topNavChrome(pathname, me)
  const innerClass = isOwnerPath(pathname)
    ? 'flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 px-5 md:px-16'
    : `${GUEST_COLUMN_CLASS} flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2`

  return (
    <header className="w-full border-b border-hairline bg-canvas text-ink">
      <div className={innerClass}>
        <Link to={chrome.brand.to} className="pitch-display flex items-center gap-2 text-lg text-ink">
          <img src="/esyres-mark.svg" width={24} height={24} alt="" aria-hidden="true" />
          {t(chrome.brand.brandKey)}
        </Link>
        {chrome.slot === 'empty' ? null : (
          <nav className="ml-auto flex flex-wrap items-center gap-4">
            {chrome.slot === 'home-guest' ? (
              <>
                <button type="button" className={linkClass} onClick={onLogin}>
                  {t('auth.login')}
                </button>
                <button type="button" className={linkClass} onClick={onRegister}>
                  {t('auth.register')}
                </button>
                <Link to={chrome.panel.href} className={panelClass}>
                  {t(chrome.panel.kind === 'panel' ? 'home.panel' : 'home.getPanel')}
                </Link>
              </>
            ) : null}
            {chrome.slot === 'admin' ? (
              <>
                {chrome.personName ? (
                  <span className={linkClass}>{t('nav.welcome', { name: chrome.personName })}</span>
                ) : null}
                <button type="button" disabled={loggingOut} className={logoutClass} onClick={() => void logout()}>
                  {loggingOut ? <Spinner className="mr-2 size-4" /> : null}
                  {t('home.logout')}
                </button>
                <Link to="/admin/dashboard" className={linkClass}>
                  {t('admin.overview')}
                </Link>
              </>
            ) : null}
            {chrome.slot === 'home-session' ? (
              <>
                {chrome.personName ? (
                  <span className={linkClass}>{t('nav.welcome', { name: chrome.personName })}</span>
                ) : null}
                {chrome.profile ? (
                  <Link to={PROFILE_HREF} className={linkClass}>
                    {t('nav.profile')}
                  </Link>
                ) : null}
                <Link to={BOOKINGS_HREF} className={linkClass}>
                  {t('nav.bookings')}
                </Link>
                <button type="button" disabled={loggingOut} className={logoutClass} onClick={() => void logout()}>
                  {loggingOut ? <Spinner className="mr-2 size-4" /> : null}
                  {t('home.logout')}
                </button>
                <Link to={chrome.panel.href} className={panelClass}>
                  {t(chrome.panel.kind === 'panel' ? 'home.panel' : 'home.getPanel')}
                </Link>
              </>
            ) : null}
            {chrome.slot === 'discovery' ? (
              <>
                {chrome.personName ? (
                  <span className={linkClass}>{t('nav.welcome', { name: chrome.personName })}</span>
                ) : null}
                {chrome.profile ? (
                  <Link to={PROFILE_HREF} className={linkClass}>
                    {t('nav.profile')}
                  </Link>
                ) : null}
                <Link to={BOOKINGS_HREF} className={linkClass}>
                  {t('nav.bookings')}
                </Link>
              </>
            ) : null}
            {chrome.slot === 'customer-session' ? (
              <>
                {chrome.personName ? (
                  <span className={linkClass}>{t('nav.welcome', { name: chrome.personName })}</span>
                ) : null}
                {chrome.profile ? (
                  <Link to={PROFILE_HREF} className={linkClass}>
                    {t('nav.profile')}
                  </Link>
                ) : null}
                <Link to={BOOKINGS_HREF} className={linkClass}>
                  {t('nav.bookings')}
                </Link>
                <button type="button" disabled={loggingOut} className={logoutClass} onClick={() => void logout()}>
                  {loggingOut ? <Spinner className="mr-2 size-4" /> : null}
                  {t('home.logout')}
                </button>
              </>
            ) : null}
            {chrome.slot === 'session' ? (
              <>
                {chrome.personName ? (
                  <span className={linkClass}>{t('nav.welcome', { name: chrome.personName })}</span>
                ) : null}
                <button type="button" disabled={loggingOut} className={logoutClass} onClick={() => void logout()}>
                  {loggingOut ? <Spinner className="mr-2 size-4" /> : null}
                  {t('home.logout')}
                </button>
              </>
            ) : null}
            {chrome.slot === 'greeting' ? (
              <span className={linkClass}>{t('nav.welcome', { name: chrome.personName })}</span>
            ) : null}
          </nav>
        )}
      </div>
    </header>
  )
}
