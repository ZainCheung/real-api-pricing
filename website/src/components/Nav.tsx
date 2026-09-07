import { useI18n } from '../lib/i18n'

const GH = 'https://github.com/ZainCheung/real-api-pricing'

export function Nav() {
  const { t, toggle } = useI18n()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2.5">
          <span
            className="block h-4 w-4 rotate-12 border border-white/90"
            aria-hidden
          />
          <span className="text-[13px] font-semibold tracking-wide text-ink">
            {t('brand')}
          </span>
        </a>
        <nav className="flex items-center gap-4 text-[13px] text-ink-muted sm:gap-5">
          <a className="hidden hover:text-ink sm:inline" href="#compare">
            {t('navCompare')}
          </a>
          <a className="hidden hover:text-ink sm:inline" href="#leaderboard">
            {t('navLeaderboard')}
          </a>
          <a className="hidden hover:text-ink md:inline" href="#overview">
            {t('navOverview')}
          </a>
          <a className="hidden hover:text-ink sm:inline" href="#method">
            {t('navMethod')}
          </a>
          <a className="hidden hover:text-ink sm:inline" href="#data">
            {t('navData')}
          </a>
          <button
            type="button"
            onClick={toggle}
            className="hover:text-ink"
          >
            {t('langToggle')}
          </button>
          <a
            href={GH}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            {t('github')}
          </a>
        </nav>
      </div>
    </header>
  )
}
