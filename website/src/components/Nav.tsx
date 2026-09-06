import { useI18n } from '../lib/i18n'

const GH = 'https://github.com/ZainCheung/real-api-pricing'

export function Nav() {
  const { t, toggle } = useI18n()

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent-dim text-sm font-semibold text-accent">
            R
          </span>
          <span className="text-sm font-semibold tracking-wide text-ink group-hover:text-accent">
            {t('brand')}
          </span>
        </a>
        <nav className="flex items-center gap-1 text-sm text-ink-muted sm:gap-2">
          <a className="hidden rounded-lg px-3 py-1.5 hover:bg-white/5 hover:text-ink sm:inline" href="#charts">
            {t('navCharts')}
          </a>
          <a className="hidden rounded-lg px-3 py-1.5 hover:bg-white/5 hover:text-ink sm:inline" href="#method">
            {t('navMethod')}
          </a>
          <a className="hidden rounded-lg px-3 py-1.5 hover:bg-white/5 hover:text-ink sm:inline" href="#data">
            {t('navData')}
          </a>
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg border border-border px-3 py-1.5 font-medium text-ink hover:border-accent/40 hover:text-accent"
          >
            {t('langToggle')}
          </button>
          <a
            href={GH}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border px-3 py-1.5 hover:border-accent/40 hover:text-accent"
          >
            {t('github')}
          </a>
        </nav>
      </div>
    </header>
  )
}
