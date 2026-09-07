import type { SnapshotStats } from '../lib/stats'
import { useI18n } from '../lib/i18n'

export function Hero({ stats }: { stats: SnapshotStats }) {
  const { t } = useI18n()

  const strip = [
    { label: t('statTotal'), value: String(stats.total) },
    { label: t('statSub'), value: String(stats.subscription) },
    { label: t('statApi'), value: String(stats.metered) },
    { label: t('statVendors'), value: String(stats.vendors) },
  ]

  return (
    <section id="top" className="relative">
      <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:pb-20 sm:pt-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                className="block h-7 w-7 rotate-12 border-2 border-white"
                aria-hidden
              />
              <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                {t('brand')}
              </h1>
            </div>
            <p className="mt-2 text-sm text-ink-dim">{t('heroKicker')}</p>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted sm:text-base">
              {t('heroSub')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#charts"
                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-neutral-200"
              >
                {t('ctaExplore')} →
              </a>
              <a
                href="#data"
                className="inline-flex items-center rounded-md border border-border-strong px-4 py-2 text-[13px] font-medium text-ink hover:border-neutral-500"
              >
                {t('ctaData')}
              </a>
            </div>
          </div>

          <div className="shrink-0 lg:min-w-[11rem]">
            <ul className="space-y-2.5">
              {strip.map((item) => (
                <li
                  key={item.label}
                  className="flex items-baseline justify-between gap-6 text-[13px] lg:justify-start lg:gap-3"
                >
                  <span className="text-ink-dim">{item.label}</span>
                  <span className="num text-base font-semibold text-ink">{item.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] text-ink-dim">
              {t('snapshotAsOf')} {stats.generatedAt}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
