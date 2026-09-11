import { useTranslation } from 'react-i18next'

type Props = {
  onContinue: () => void
}

export function CompanyPitch({ onContinue }: Props) {
  const { t } = useTranslation()

  return (
    <main className="company-pitch mx-auto flex min-h-svh max-w-3xl flex-col px-5 py-8 md:px-16 md:py-12">
      <p className="pitch-display flex items-center gap-2 text-lg text-ink">
        <img src="/esyres-mark.svg" width={24} height={24} alt="" aria-hidden="true" />
        {t('pitch.brand')}
      </p>
      <h1 className="pitch-display mt-10 text-[32px] leading-[1.15] text-ink md:mt-16 md:text-5xl lg:text-6xl">
        {t('pitch.h1')}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-6 text-body md:text-lg">{t('pitch.support')}</p>
      <ol className="mt-8 max-w-xl list-decimal space-y-3 pl-5 text-base leading-6 text-body">
        <li>{t('pitch.step1')}</li>
        <li>{t('pitch.step2')}</li>
        <li>{t('pitch.step3')}</li>
      </ol>
      <button
        type="button"
        onClick={onContinue}
        className="mt-10 h-10 w-fit rounded-md bg-ink px-5 text-sm font-semibold text-canvas active:bg-[#242424]"
      >
        {t('pitch.cta')}
      </button>
    </main>
  )
}
