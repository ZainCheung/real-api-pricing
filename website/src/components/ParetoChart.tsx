import { useMemo } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { BoardKey, BoardMeta, PricingPoint } from '../types'
import { useI18n } from '../lib/i18n'
import { boardPoints, scoreKey, subscriptionFrontier, variantKey } from '../lib/pareto'
import { vendorColor } from '../lib/vendors'
import { ChartTooltipShell } from './ChartTooltip'

type Row = {
  id: string
  x: number
  y: number
  label: string
  vendor: string
  billing: string
  variant: string
  color: string
  kind: 'sub' | 'api' | 'frontier'
}

export function ParetoChart({
  board,
  meta,
  points,
}: {
  board: BoardKey
  meta: BoardMeta
  points: PricingPoint[]
}) {
  const { t, lang } = useI18n()
  const key = scoreKey(board)
  const vkey = variantKey(board)

  const { subs, apis, frontier, domain } = useMemo(() => {
    const scored = boardPoints(points, board)
    const frontierPts = subscriptionFrontier(points, board)
    const frontierIds = new Set(frontierPts.map((p) => p.id))

    const toRow = (p: PricingPoint, kind: Row['kind']): Row => ({
      id: p.id,
      x: p.real_usd_per_mtok,
      y: Number(p[key]),
      label: p.label,
      vendor: p.vendor,
      billing: p.billing,
      variant: String(p[vkey] ?? ''),
      color: vendorColor(p.vendor),
      kind,
    })

    const subs = scored
      .filter((p) => p.billing === 'subscription' && !frontierIds.has(p.id))
      .map((p) => toRow(p, 'sub'))
    const apis = scored.filter((p) => p.billing === 'metered').map((p) => toRow(p, 'api'))
    const frontier = frontierPts.map((p) => toRow(p, 'frontier'))

    const xs = scored.map((p) => p.real_usd_per_mtok)
    const ys = scored.map((p) => Number(p[key]))
    const xmin = Math.min(...xs) / 1.5
    const xmax = Math.max(...xs) * 1.5
    const ymin = Math.min(...ys)
    const ymax = Math.max(...ys)
    const pad = (ymax - ymin) * 0.08 || 1

    return {
      subs,
      apis,
      frontier: [...frontier].sort((a, b) => b.x - a.x),
      domain: {
        x: [xmin, xmax] as [number, number],
        y: [ymin - pad, ymax + pad] as [number, number],
      },
    }
  }, [points, board, key, vkey])

  const boardTitle =
    lang === 'zh'
      ? (
          {
            arena_code: 'Code Arena',
            arena_agent_mode: 'Agent Arena',
            aa_intelligence_index: 'AA 智力榜',
            aa_coding_agent_index: 'AA 编程 Agent',
          } as const
        )[board]
      : (
          {
            arena_code: 'Code Arena',
            arena_agent_mode: 'Agent Arena',
            aa_intelligence_index: 'AA Intelligence',
            aa_coding_agent_index: 'AA Coding Agent',
          } as const
        )[board]

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-ink">{boardTitle}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {meta.metric} · {meta.snapshot}
          </p>
        </div>
        <a
          href={meta.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-accent hover:underline"
        >
          {meta.name} ↗
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> {t('frontierLegend')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink-muted/80" /> {t('subLegend')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-accent/80" /> {t('apiLegend')}
        </span>
        <span className="ml-auto text-ink-dim">{t('cheaperRight')}</span>
      </div>

      <div className="mt-4 h-[380px] sm:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 12, right: 16, bottom: 12, left: 8 }}>
            <CartesianGrid stroke="rgba(36,48,42,0.85)" strokeDasharray="3 6" />
            <XAxis
              type="number"
              dataKey="x"
              scale="log"
              domain={domain.x}
              reversed
              allowDataOverflow
              tick={{ fill: '#8b948e', fontSize: 11 }}
              tickFormatter={(v) => `$${Number(v)}`}
              stroke="#24302a"
              name={t('tooltipPrice')}
              label={{
                value: t('tooltipPrice'),
                position: 'insideBottom',
                offset: -4,
                fill: '#5f6862',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={domain.y}
              tick={{ fill: '#8b948e', fontSize: 11 }}
              stroke="#24302a"
              name={meta.metric}
              width={48}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Row | undefined
                if (!row) return null
                return (
                  <ChartTooltipShell active={active}>
                    <div className="font-medium text-ink">{row.label}</div>
                    <div className="mt-1 text-ink-muted">
                      {row.billing === 'metered' ? t('billingApi') : t('billingSub')} · {row.vendor}
                    </div>
                    {row.variant ? (
                      <div className="mt-1 max-w-xs truncate text-ink-dim">{row.variant}</div>
                    ) : null}
                    <div className="num mt-1 text-accent">
                      {t('tooltipPrice')}: ${row.x.toPrecision(4)}
                    </div>
                    <div className="num text-ink">
                      {t('tooltipScore')}: {row.y}
                    </div>
                  </ChartTooltipShell>
                )
              }}
            />
            <Scatter
              name="subs"
              data={subs}
              fill="#64748b"
              fillOpacity={0.55}
              shape={(props: { cx?: number; cy?: number; payload?: Row }) => {
                const { cx = 0, cy = 0, payload } = props
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload?.color ?? '#64748b'}
                    fillOpacity={0.55}
                  />
                )
              }}
            />
            <Scatter
              name="apis"
              data={apis}
              shape={(props: { cx?: number; cy?: number; payload?: Row }) => {
                const { cx = 0, cy = 0, payload } = props
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="transparent"
                    stroke={payload?.color ?? '#2dd4bf'}
                    strokeWidth={1.5}
                  />
                )
              }}
            />
            <Line
              data={frontier}
              type="linear"
              dataKey="y"
              stroke="rgba(45,212,191,0.55)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              legendType="none"
            />
            <Scatter
              name="frontier"
              data={frontier}
              shape={(props: { cx?: number; cy?: number; payload?: Row }) => {
                const { cx = 0, cy = 0, payload } = props
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5.5}
                    fill={payload?.color ?? '#2dd4bf'}
                    stroke="#0b0f0e"
                    strokeWidth={1.5}
                  />
                )
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
