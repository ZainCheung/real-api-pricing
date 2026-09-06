import type { SnapshotStats } from '../lib/stats'
import { useI18n } from '../lib/i18n'

export function StatStrip({ stats }: { stats: SnapshotStats }) {
  const { t, lang } = useI18n()

  const items = [
    { label: t('statTotal'), value: String(stats.total) },
    { label: t('statSub'), value: String(stats.subscription) },
    { label: t('statApi'), value: String(stats.metered) },
    { label: t('statOpenCode'), value: `${stats.opencodeGo} / 28` },
    {
      label: t('statArena'),
      value: `${stats.arenaCode} / ${stats.arenaAgent}`,
    },
    {
      label: t('statAA'),
      value: `${stats.aaIntel} / ${stats.aaCoding}`,
    },
  ]

  return (
    <section className="border-y border-border bg-bg-elevated/60">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
            {t('snapshotTitle')}
          </h2>
          <p className="text-sm text-ink-dim">
            {t('snapshotAsOf')}: <span className="num text-ink">{stats.generatedAt}</span>
            {lang === 'zh' ? '' : ''}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <div key={item.label} className="card card-hover px-4 py-5">
              <div className="num text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {item.value}
              </div>
              <div className="mt-2 text-xs leading-snug text-ink-muted">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
