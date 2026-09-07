import type { BoardKey } from '../types'
import type { QuickInsights as Insights } from '../lib/stats'
import { useI18n } from '../lib/i18n'
import { formatAllowanceYi, formatScore, formatSnapshotDate, formatUsdPerMtok } from '../lib/format'
import { scoreKey } from '../lib/pareto'
import { vendorColor } from '../lib/vendors'

export function QuickInsights({
  insights,
  generatedAt,
}: {
  insights: Insights
  generatedAt: string
}) {
  const { t, lang } = useI18n()
  const { lowest, largest, frontier } = insights
  const frontierScore = frontier
    ? (frontier[scoreKey('arena_code' satisfies BoardKey)] as number | null)
    : null

  const cards = [
    {
      key: 'lowest',
      label: t('insightLowest'),
      value: lowest ? formatUsdPerMtok(lowest.real_usd_per_mtok) : '—',
      sub: lowest ? lowest.label : '—',
      color: lowest ? vendorColor(lowest.vendor) : undefined,
    },
    {
      key: 'largest',
      label: t('insightLargest'),
      value: largest ? formatAllowanceYi(largest.monthly_yi, lang) : '—',
      sub: largest ? largest.label : '—',
      color: largest ? vendorColor(largest.vendor) : undefined,
    },
    {
      key: 'frontier',
      label: t('insightFrontier'),
      value: frontier ? formatScore(frontierScore) : '—',
      sub: frontier
        ? `${frontier.label} · ${formatUsdPerMtok(frontier.real_usd_per_mtok)}`
        : t('insightFrontierHint'),
      color: frontier ? vendorColor(frontier.vendor) : undefined,
    },
    {
      key: 'snapshot',
      label: t('insightSnapshot'),
      value: formatSnapshotDate(generatedAt, lang),
      sub: '',
      color: undefined,
    },
  ]

  return (
    <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:min-w-[22rem] lg:max-w-[26rem]">
      {cards.map((card) => (
        <li key={card.key} className="card px-3.5 py-3">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-dim">
            {card.color ? (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: card.color }}
                aria-hidden
              />
            ) : null}
            {card.label}
          </div>
          <div className="num mt-1.5 text-[15px] font-semibold text-ink">{card.value}</div>
          {card.sub ? (
            <div className="mt-1 truncate text-[11px] leading-snug text-ink-muted" title={card.sub}>
              {card.sub}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
