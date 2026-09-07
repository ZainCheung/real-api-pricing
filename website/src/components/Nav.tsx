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
          <a className="hidden hover:text-ink sm:inline" href="#charts">
            {t('navCharts')}
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
          <span
            className="hidden h-4 w-4 items-center justify-center text-ink-dim sm:inline-flex"
            title="Dark"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.5">
              <path d="M21 14.3A8.5 8.5 0 1 1 9.7 3 7 7 0 0 0 21 14.3z" />
            </svg>
          </span>
        </nav>
      </div>
    </header>
  )
}
