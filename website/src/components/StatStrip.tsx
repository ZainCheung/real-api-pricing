import type { SnapshotStats } from '../lib/stats'
import { useI18n } from '../lib/i18n'

/** Secondary compact metrics under hero (DeepSWE-style muted strip). */
export function StatStrip({ stats }: { stats: SnapshotStats }) {
  const { t } = useI18n()

  const items = [
    { label: t('statOpenCode'), value: `${stats.opencodeGo} / 28` },
    { label: t('statArena'), value: `${stats.arenaCode} / ${stats.arenaAgent}` },
    { label: t('statAA'), value: `${stats.aaIntel} / ${stats.aaCoding}` },
  ]

  return (
    <section className="border-y border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-dim">
          {t('snapshotTitle')}
        </span>
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline gap-2 text-[13px]">
            <span className="text-ink-dim">{item.label}</span>
            <span className="num font-semibold text-ink">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
