import { useMemo, useState } from 'react'
import type { PricingPoint } from '../types'
import { useI18n } from '../lib/i18n'
import { vendorColor } from '../lib/vendors'
import { shortLabel } from '../lib/labels'
import { applyLimit, CHART_LIMITS, chartLimitKey, type ChartLimit } from '../lib/limits'
import { formatUsdTick, logPosition, logPriceAxis } from '../lib/axis'
import { formatUsdPerMtok } from '../lib/format'
import { Pill, PillGroup } from './Pill'

export function PriceChart({ points }: { points: PricingPoint[] }) {
  const { t } = useI18n()
  const [limit, setLimit] = useState<ChartLimit>(15)
  const [hoverId, setHoverId] = useState<string | null>(null)

  const data = useMemo(() => {
    const sorted = points.slice().sort((a, b) => a.real_usd_per_mtok - b.real_usd_per_mtok)
    return applyLimit(sorted, limit).map((p) => ({
      id: p.id,
      label: p.label,
      short: shortLabel(p.label, 42),
      plan: p.plan,
      model: p.model_display,
      vendor: p.vendor,
      billing: p.billing,
      value: p.real_usd_per_mtok,
      color: vendorColor(p.vendor),
    }))
  }, [points, limit])

  const axis = useMemo(() => logPriceAxis(data.map((d) => d.value)), [data])

  return (
    <div className="card chart-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">{t('priceTitle')}</h3>
          <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">{t('priceSub')}</p>
        </div>
        <PillGroup>
          {CHART_LIMITS.map((n) => (
            <Pill key={String(n)} active={limit === n} onClick={() => setLimit(n)}>
              {t(chartLimitKey(n))}
            </Pill>
          ))}
        </PillGroup>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="bar-table min-w-[640px]">
          <thead>
            <tr>
              <th className="w-[38%]">{t('colPlanModel')}</th>
              <th className="w-[42%]">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.06em] text-ink-dim">
                  <span>{t('priceCheap')}</span>
                  <span>{t('priceExpensive')}</span>
                </div>
                <div className="dot-axis mt-1.5">
                  {axis.ticks.map((tick) => (
                    <span
                      key={`tick-${tick}`}
                      className="dot-tick"
                      style={{ left: `${logPosition(tick, axis.domain)}%` }}
                    />
                  ))}
                  {axis.ticks.map((tick) => (
                    <span
                      key={`lbl-${tick}`}
                      className="dot-axis-label"
                      style={{ left: `${logPosition(tick, axis.domain)}%` }}
                    >
                      {formatUsdTick(tick)}
                    </span>
                  ))}
                  <span className="dot-rail" />
                </div>
              </th>
              <th className="w-[20%] !pr-0 !text-right">{t('tooltipPrice')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const left = logPosition(row.value, axis.domain)
              const active = hoverId === row.id
              const isApi = row.billing === 'metered'
              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => setHoverId(row.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className={active ? 'bg-white/[0.02]' : undefined}
                  title={`${row.label}\n${isApi ? 'API' : 'Sub'} · ${row.vendor} · ${formatUsdPerMtok(row.value)}`}
                >
                  <td>
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                        style={{
                          background: isApi ? 'transparent' : row.color,
                          boxShadow: isApi ? `inset 0 0 0 1.5px ${row.color}` : undefined,
                        }}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-ink">
                          {row.short}
                        </div>
                        <div className="truncate text-[11px] text-ink-dim">
                          {isApi ? t('billingApi') : t('billingSub')} · {row.vendor}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="dot-track">
                      {axis.ticks.map((tick) => (
                        <span
                          key={tick}
                          className="dot-tick"
                          style={{ left: `${logPosition(tick, axis.domain)}%` }}
                        />
                      ))}
                      <span className="dot-rail" />
                      <span
                        className="dot-mark"
                        style={{
                          left: `${left}%`,
                          background: isApi ? 'transparent' : row.color,
                          boxShadow: isApi
                            ? `inset 0 0 0 1.5px ${row.color}`
                            : active
                              ? `0 0 0 3px ${row.color}33`
                              : undefined,
                          opacity: active ? 1 : 0.92,
                        }}
                      />
                    </div>
                  </td>
                  <td className="!pr-0 !text-right">
                    <span className="num text-[13px] text-ink">{formatUsdPerMtok(row.value)}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
