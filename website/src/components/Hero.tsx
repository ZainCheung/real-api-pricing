import { useI18n } from '../lib/i18n'

export function Hero() {
  const { t } = useI18n()

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />
      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pb-24 sm:pt-28">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-accent">
          {t('heroKicker')}
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-5xl md:text-6xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {t('heroSub')}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="#charts"
            className="inline-flex items-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg shadow-[0_0_40px_rgba(45,212,191,0.25)] hover:bg-accent-soft"
          >
            {t('ctaExplore')}
          </a>
          <a
            href="#data"
            className="inline-flex items-center rounded-xl border border-border-strong bg-bg-elevated px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent/50"
          >
            {t('ctaData')}
          </a>
        </div>
      </div>
    </section>
  )
}
