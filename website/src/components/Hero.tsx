import type { SnapshotStats, QuickInsights as Insights } from '../lib/stats'
import { useI18n } from '../lib/i18n'
import { QuickInsights } from './QuickInsights'

export function Hero({
  stats,
  insights,
}: {
  stats: SnapshotStats
  insights: Insights
}) {
  const { t } = useI18n()

  return (
    <section id="top" className="relative">
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-14 sm:pb-16 sm:pt-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-dim">
              {t('heroEyebrow')}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted sm:text-base">
              {t('heroSub')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#compare"
                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-[13px] font-semibold text-black hover:bg-neutral-200"
              >
                {t('ctaCompare')} \u2192
              </a>
              <a
                href="#method"
                className="inline-flex items-center rounded-md border border-border-strong px-4 py-2 text-[13px] font-medium text-ink hover:border-neutral-500"
              >
                {t('ctaMethod')}
              </a>
            </div>
          </div>

          <QuickInsights insights={insights} generatedAt={stats.generatedAt} />
        </div>
      </div>
    </section>
  )
}
