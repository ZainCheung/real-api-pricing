import { useMemo, useState } from 'react'
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
import { boardPoints, scoreKey, variantKey } from '../lib/pareto'
import { vendorColor } from '../lib/vendors'
import { BOARD_KEYS, boardTitle, scatterLabel } from '../lib/labels'
import { ChartTooltipShell } from './ChartTooltip'
import { Pill, PillGroup } from './Pill'
import { UsdAxisTick } from './UsdAxisTick'

type Row = {
  id: string
  x: number
  y: number
  label: string
  short: string
  vendor: string
  billing: string
  plan: string
  variant: string
  color: string
  model: string
  kind: 'sub' | 'api'
  showLabel: boolean
  efficient: boolean
  labelSide: 'left' | 'right'
  efficientText: string
}

type Range = {
  model: string
  color: string
  data: { x: number; y: number }[]
}

type LabelProps = {
  x?: number | string
  y?: number | string
  payload?: Row
}

function PointLabel(props: LabelProps) {
  const { x = 0, y = 0, payload } = props
  if (!payload?.showLabel) return null
  const cx = Number(x)
  const cy = Number(y)
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null

  const onRight = payload.labelSide === 'right'
  const dx = onRight ? -10 : 10
  const anchor = onRight ? 'end' : 'start'
  const sub = payload.efficient
    ? payload.efficientText
    : payload.plan.length > 18
      ? `${payload.plan.slice(0, 17)}…`
      : payload.plan

  return (
    <g pointerEvents="none">
      <text
        x={cx + dx}
        y={cy - 2}
        textAnchor={anchor}
        fill={payload.color}
        fontSize={12}
        fontWeight={500}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {payload.short}
      </text>
      {sub ? (
        <text
          x={cx + dx}
          y={cy + 11}
          textAnchor={anchor}
          fill="#737373"
          fontSize={10}
          fontStyle={payload.efficient ? 'italic' : 'normal'}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {sub}
        </text>
      ) : null}
    </g>
  )
}

function uniqueByPrice(pts: PricingPoint[]): PricingPoint[] {
  const m = new Map<number, PricingPoint>()
  for (const p of pts) {
    const prev = m.get(p.real_usd_per_mtok)
    if (!prev || (prev.billing === 'metered' && p.billing === 'subscription')) {
      m.set(p.real_usd_per_mtok, p)
    }
  }
  return [...m.values()]
}

function pickLabelIds(rows: Row[], efficientId: string): Set<string> {
  const ids = new Set<string>()
  if (efficientId) ids.add(efficientId)
  if (!rows.length) return ids
  const ranked = [...rows].sort((a, b) => b.y - a.y)
  for (const r of ranked.slice(0, 6)) ids.add(r.id)

  const log = (x: number) => Math.log10(Math.max(x, 1e-9))
  const xs = rows.map((r) => log(r.x))
  const ys = rows.map((r) => r.y)
  const xspan = Math.max(...xs) - Math.min(...xs) || 1
  const yspan = Math.max(...ys) - Math.min(...ys) || 1
  const placed = rows.filter((r) => ids.has(r.id))
  const far = (a: Row, b: Row) => {
    const dx = (log(a.x) - log(b.x)) / xspan
    const dy = (a.y - b.y) / yspan
    return dx * dx + dy * dy > 0.055
  }
  for (const r of ranked) {
    if (ids.size >= 12) break
    if (ids.has(r.id)) continue
    if (placed.every((p) => far(p, r))) {
      ids.add(r.id)
      placed.push(r)
    }
  }
  return ids
}

export function LeaderboardChart({
  points,
  boards,
}: {
  points: PricingPoint[]
  boards: Record<BoardKey, BoardMeta>
}) {
  const { t, lang } = useI18n()
  const [board, setBoard] = useState<BoardKey>('arena_code')
  const meta = boards[board]
  const key = scoreKey(board)
  const vkey = variantKey(board)
  const efficientText = t('mostEfficient')

  const { subs, apis, ranges, domain, xTicks, yTicks, modelCount } = useMemo(() => {
    const scored = boardPoints(points, board)
    const byModel = new Map<string, PricingPoint[]>()
    for (const p of scored) {
      const list = byModel.get(p.model) ?? []
      list.push(p)
      byModel.set(p.model, list)
    }

    const cheapest: PricingPoint[] = []
    const ranges: Range[] = []
    const allPts: PricingPoint[] = []

    for (const [model, group] of byModel) {
      const uniq = uniqueByPrice(group)
      allPts.push(...uniq)
      const sorted = [...uniq].sort((a, b) => a.real_usd_per_mtok - b.real_usd_per_mtok)
      const low = sorted[0]
      cheapest.push(low)
      if (sorted.length >= 2) {
        const high = sorted[sorted.length - 1]
        ranges.push({
          model,
          color: vendorColor(low.vendor),
          data: [
            { x: low.real_usd_per_mtok, y: Number(low[key]) },
            { x: high.real_usd_per_mtok, y: Number(high[key]) },
          ],
        })
      }
    }

    const ys = cheapest.map((p) => Number(p[key]))
    const maxY = ys.length ? Math.max(...ys) : 0
    const minY = ys.length ? Math.min(...ys) : 0
    const cutoff = maxY - 0.15 * (maxY - minY || 1)
    const nearTop = cheapest.filter((p) => Number(p[key]) >= cutoff)
    const efficientPt = nearTop.length
      ? nearTop.reduce((a, b) => (a.real_usd_per_mtok <= b.real_usd_per_mtok ? a : b))
      : undefined
    const efficientId = efficientPt?.id ?? ''

    const xAxis = logPriceAxis(allPts.map((p) => p.real_usd_per_mtok))
    const logLo = Math.log10(xAxis.domain[0])
    const logHi = Math.log10(xAxis.domain[1])
    const logSpan = logHi - logLo || 1

    const toRow = (p: PricingPoint, isCheapest: boolean): Row => {
      const x = p.real_usd_per_mtok
      const tRel = (Math.log10(x) - logLo) / logSpan
      return {
        id: p.id,
        x,
        y: Number(p[key]),
        label: p.label,
        short: scatterLabel(p.model_display || p.label, 22),
        vendor: p.vendor,
        billing: p.billing,
        plan: p.plan,
        variant: String(p[vkey] ?? ''),
        color: vendorColor(p.vendor),
        model: p.model,
        kind: p.billing === 'metered' ? 'api' : 'sub',
        showLabel: false,
        efficient: isCheapest && p.id === efficientId,
        // reversed axis: cheap (low tRel) sits on the right
        labelSide: tRel < 0.28 ? 'right' : 'left',
        efficientText,
      }
    }

    const cheapestIds = new Set(cheapest.map((p) => p.id))
    const rows = allPts.map((p) => toRow(p, cheapestIds.has(p.id)))
    const cheapestRows = rows.filter((r) => cheapestIds.has(r.id))
    const labelIds = pickLabelIds(cheapestRows, efficientId)
    for (const r of rows) {
      if (labelIds.has(r.id)) r.showLabel = true
    }

    const pad = (maxY - minY) * 0.14 || 1
    const yDomain: [number, number] = [minY - pad * 0.4, maxY + pad]

    return {
      subs: rows.filter((r) => r.kind === 'sub'),
      apis: rows.filter((r) => r.kind === 'api'),
      ranges,
      domain: { x: xAxis.domain, y: yDomain },
      xTicks: xAxis.ticks,
      yTicks: niceLinearTicks(yDomain[0], yDomain[1], 5),
      modelCount: byModel.size,
    }
  }, [points, board, key, vkey, efficientText])

  const tickStyle = { fill: '#a3a3a3', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }

  return (
    <div className="card chart-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillGroup>
          {BOARD_KEYS.map((b) => (
            <Pill key={b} active={board === b} onClick={() => setBoard(b)}>
              {boardTitle(b, lang)}
            </Pill>
          ))}
        </PillGroup>
        <p className="text-[12px] text-ink-dim">
          {modelCount} {lang === 'zh' ? '个模型' : 'models'} · {meta.snapshot}
          <span className="ml-3 text-ink-muted">{t('cheaperRight')}</span>
        </p>
      </div>

      <div className="relative mt-4 h-[480px] min-h-[400px] overflow-visible sm:h-[540px]">
        <div className="pointer-events-none absolute left-16 top-1 z-10 text-[12px] text-ink-muted">
          {meta.metric}
        </div>
        <ResponsiveContainer width="100%" height="100%" minHeight={400}>
          <ComposedChart margin={{ top: 28, right: 108, bottom: 36, left: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="0" />
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
              width={52}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Row | undefined
                if (!row || row.x == null || row.y == null || !row.label) return null
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
            {ranges.map((r) => (
              <Line
                key={r.model}
                data={r.data}
                type="linear"
                dataKey="y"
                stroke={r.color}
                strokeWidth={1.5}
                strokeOpacity={0.45}
                dot={false}
                isAnimationActive={false}
                legendType="none"
                tooltipType="none"
                activeDot={false}
              />
            ))}
            <Scatter
              name="subs"
              data={subs}
              isAnimationActive={false}
              shape={(props: { cx?: number; cy?: number; payload?: Row }) => {
                const { cx = 0, cy = 0, payload } = props
                const labeled = payload?.showLabel
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={labeled ? 5.5 : 4}
                      fill={payload?.color ?? '#737373'}
                      fillOpacity={labeled ? 1 : 0.7}
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
                const labeled = payload?.showLabel
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={labeled ? 5.5 : 4.5}
                      fill="transparent"
                      stroke={payload?.color ?? '#a3a3a3'}
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
