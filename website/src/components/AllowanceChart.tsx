import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PricingPoint } from '../types'
import { useI18n } from '../lib/i18n'
import { vendorColor } from '../lib/vendors'
import { subscriptionPoints } from '../lib/stats'
import { ChartTooltipShell } from './ChartTooltip'

const LIMITS = [25, 50, 91] as const

export function AllowanceChart({ points }: { points: PricingPoint[] }) {
  const { t, lang } = useI18n()
  const [limit, setLimit] = useState<(typeof LIMITS)[number]>(25)

  const data = useMemo(() => {
    const rows = subscriptionPoints(points)
      .slice()
      .sort((a, b) => (b.monthly_yi ?? 0) - (a.monthly_yi ?? 0))
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        label: p.label,
        plan: p.plan,
        model: p.model_display,
        vendor: p.vendor,
        value: p.monthly_yi ?? 0,
        display: lang === 'en' ? (p.monthly_yi ?? 0) / 10 : (p.monthly_yi ?? 0),
        color: vendorColor(p.vendor),
      }))
    return rows.reverse()
  }, [points, limit, lang])

  const height = Math.max(360, data.length * 22)

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-ink">{t('allowanceTitle')}</h3>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">{t('allowanceSub')}</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1 text-xs">
          {LIMITS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setLimit(n)}
              className={`rounded-md px-2.5 py-1 ${
                limit === n ? 'bg-accent-dim text-accent' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {n === 91 ? t('allPoints') : `${t('showTop')} ${n}`}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="rgba(36,48,42,0.8)" strokeDasharray="3 6" horizontal={false} />
            <XAxis
              type="number"
              scale="log"
              domain={['auto', 'auto']}
              allowDataOverflow
              tick={{ fill: '#8b948e', fontSize: 11 }}
              tickFormatter={(v) => {
                const n = Number(v)
                if (n >= 100) return n.toFixed(0)
                if (n >= 10) return n.toFixed(1)
                return n.toPrecision(2)
              }}
              stroke="#24302a"
              label={{
                value: t('tooltipAllowance'),
                position: 'insideBottom',
                offset: -2,
                fill: '#5f6862',
                fontSize: 11,
              }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={168}
              tick={{ fill: '#c5ccc7', fontSize: 10 }}
              stroke="#24302a"
              interval={0}
            />
            <Tooltip
              cursor={{ fill: 'rgba(45,212,191,0.06)' }}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as (typeof data)[0] | undefined
                if (!row) return null
                return (
                  <ChartTooltipShell active={active}>
                    <div className="font-medium text-ink">{row.label}</div>
                    <div className="mt-1 text-ink-muted">
                      {t('tooltipVendor')}: {row.vendor}
                    </div>
                    <div className="num mt-1 text-accent">
                      {t('tooltipAllowance')}: {row.display.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                    </div>
                  </ChartTooltipShell>
                )
              }}
            />
            <Bar dataKey="display" radius={[0, 4, 4, 0]} maxBarSize={14}>
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
