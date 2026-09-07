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
import { formatUsdTick, formatYTick, logPriceAxis, niceLinearTicks } from '../lib/axis'
import { boardPoints, scoreKey, subscriptionFrontier, variantKey } from '../lib/pareto'
import { vendorColor } from '../lib/vendors'
import { boardTitle as i18nBoardTitle, scatterLabel } from '../lib/labels'
import { ChartTooltipShell } from './ChartTooltip'
import { UsdAxisTick } from './UsdAxisTick'

type Row = {
  id: string
  x: number
  y: number
  label: string
  short: string
  vendor: string
  billing: string
  variant: string
  color: string
  kind: 'sub' | 'api' | 'frontier'
  showLabel: boolean
}

type LabelProps = {
  x?: number | string
  y?: number | string
  value?: string | number
  index?: number
  payload?: Row
}

function PointLabel(props: LabelProps) {
  const { x = 0, y = 0, payload } = props
  if (!payload?.showLabel) return null
  const cx = Number(x)
  const cy = Number(y)
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null

  const variant = payload.variant
    ? payload.variant.length > 16
      ? `${payload.variant.slice(0, 15)}…`
      : payload.variant
    : ''

  // Alternate vertical offset by index parity to reduce overlap
  const bump = (payload.id.charCodeAt(0) + payload.id.length) % 2 === 0 ? -10 : 18

  return (
    <g pointerEvents="none">
      <text
        x={cx + 8}
        y={cy + bump}
        fill={payload.color}
        fontSize={12}
        fontWeight={500}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {payload.short}
      </text>
      {variant ? (
        <text
          x={cx + 8}
          y={cy + bump + 12}
          fill="#737373"
          fontSize={10}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {variant}
        </text>
      ) : null}
    </g>
  )
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

  const { subs, apis, frontier, domain, xTicks, yTicks } = useMemo(() => {
    const scored = boardPoints(points, board)
    const frontierPts = subscriptionFrontier(points, board)
    const frontierIds = new Set(frontierPts.map((p) => p.id))

    const labeledModels = new Set<string>()
    const labelIds = new Set<string>()
    for (const p of frontierPts) {
      if (labeledModels.has(p.model)) continue
      labelIds.add(p.id)
      labeledModels.add(p.model)
    }
    const rest = scored
      .filter((p) => !labelIds.has(p.id))
      .sort((a, b) => Number(b[key]) - Number(a[key]))
    for (const p of rest) {
      if (labelIds.size >= 8) break
      if (labeledModels.has(p.model)) continue
      labelIds.add(p.id)
      labeledModels.add(p.model)
    }

    const toRow = (p: PricingPoint, kind: Row['kind']): Row => ({
      id: p.id,
      x: p.real_usd_per_mtok,
      y: Number(p[key]),
      label: p.label,
      short: scatterLabel(p.label, 20),
      vendor: p.vendor,
      billing: p.billing,
      variant: String(p[vkey] ?? ''),
      color: vendorColor(p.vendor),
      kind,
      showLabel: labelIds.has(p.id),
    })

    const subs = scored
      .filter((p) => p.billing === 'subscription' && !frontierIds.has(p.id))
      .map((p) => toRow(p, 'sub'))
    const apis = scored.filter((p) => p.billing === 'metered').map((p) => toRow(p, 'api'))
    const frontier = frontierPts.map((p) => toRow(p, 'frontier'))

    const xs = scored.map((p) => p.real_usd_per_mtok)
    const ys = scored.map((p) => Number(p[key]))
    const xAxis = logPriceAxis(xs)
    const ymin = Math.min(...ys)
    const ymax = Math.max(...ys)
    const pad = (ymax - ymin) * 0.12 || 1
    const yDomain: [number, number] = [ymin - pad, ymax + pad]
    const yTicks = niceLinearTicks(yDomain[0], yDomain[1], 5)

    return {
      subs,
      apis,
      frontier: [...frontier].sort((a, b) => b.x - a.x),
      domain: {
        x: xAxis.domain,
        y: yDomain,
      },
      xTicks: xAxis.ticks,
      yTicks,
    }
  }, [points, board, key, vkey])

  const title = i18nBoardTitle(board, lang)

  const tickStyle = { fill: '#a3a3a3', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }

  return (
    <div className="card chart-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-[13px] text-ink-muted">
            {meta.metric} · {meta.snapshot}
          </p>
        </div>
        <a
          href={meta.url}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] text-ink-muted hover:text-ink"
        >
          {meta.name} ↗
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white" /> {t('frontierLegend')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink-muted/80" /> {t('subLegend')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-ink-muted" /> {t('apiLegend')}
        </span>
        <span className="ml-auto text-ink-dim">{t('cheaperRight')}</span>
      </div>

      <div className="mt-4 h-[400px] min-h-[360px] overflow-visible sm:h-[440px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={360}>
          <ComposedChart margin={{ top: 32, right: 88, bottom: 36, left: 16 }}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="0"
              vertical={false}
            />
            <XAxis
              type="number"
              dataKey="x"
              scale="log"
              domain={domain.x}
              ticks={xTicks}
              interval={0}
              minTickGap={28}
              reversed
              axisLine={false}
              tickLine={false}
              tick={(props) => <UsdAxisTick {...props} allowed={xTicks} />}
              tickFormatter={formatUsdTick}
              name={t('tooltipPrice')}
              label={{
                value: t('tooltipPrice'),
                position: 'insideBottom',
                offset: -16,
                fill: '#737373',
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={domain.y}
              ticks={yTicks}
              interval={0}
              axisLine={false}
              tickLine={false}
              tick={tickStyle}
              tickFormatter={formatYTick}
              name={meta.metric}
              width={56}
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
                      <div className="mt-1 max-w-xs text-ink-dim">{row.variant}</div>
                    ) : null}
                    <div className="num mt-1.5 text-ink">
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
              fill="#737373"
              fillOpacity={0.55}
              isAnimationActive={false}
              shape={(props: { cx?: number; cy?: number; payload?: Row }) => {
                const { cx = 0, cy = 0, payload } = props
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={payload?.color ?? '#737373'}
                      fillOpacity={0.55}
                    />
                    <PointLabel x={cx} y={cy} payload={payload} />
                  </g>
                )
              }}
            />
            <Scatter
              name="apis"
              data={apis}
              isAnimationActive={false}
              shape={(props: { cx?: number; cy?: number; payload?: Row }) => {
                const { cx = 0, cy = 0, payload } = props
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="transparent"
                      stroke={payload?.color ?? '#a3a3a3'}
                      strokeWidth={1.5}
                    />
                    <PointLabel x={cx} y={cy} payload={payload} />
                  </g>
                )
              }}
            />
            <Line
              data={frontier}
              type="linear"
              dataKey="y"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              legendType="none"
            />
            <Scatter
              name="frontier"
              data={frontier}
              isAnimationActive={false}
              shape={(props: { cx?: number; cy?: number; payload?: Row }) => {
                const { cx = 0, cy = 0, payload } = props
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5.5}
                      fill={payload?.color ?? '#ffffff'}
                      stroke="#000000"
                      strokeWidth={1.5}
                    />
                    <PointLabel x={cx} y={cy} payload={payload} />
                  </g>
                )
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
