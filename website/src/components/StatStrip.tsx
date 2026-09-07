import type { SnapshotStats } from '../lib/stats'
import { useI18n } from '../lib/i18n'
import { formatSnapshotDate } from '../lib/format'

/** Single-line dataset snapshot under the hero. */
export function StatStrip({ stats }: { stats: SnapshotStats }) {
  const { t, lang } = useI18n()

  return (
    <section className="border-y border-border">
      <div className="mx-auto max-w-6xl px-5 py-3 text-[13px] leading-relaxed text-ink-muted">
        <span className="num text-ink">{stats.total}</span> {t('snapPoints')}
        <span className="text-ink-dim"> · </span>
        <span className="num text-ink">{stats.subscription}</span> {t('snapSubs')}
        <span className="text-ink-dim"> · </span>
        <span className="num text-ink">{stats.metered}</span> {t('snapApis')}
        <span className="text-ink-dim"> · </span>
        <span className="num text-ink">{stats.vendors}</span> {t('snapVendors')}
        <span className="text-ink-dim"> · </span>
        {t('snapshotUpdated')} {formatSnapshotDate(stats.generatedAt, lang)}
      </div>
    </section>
  )
}
