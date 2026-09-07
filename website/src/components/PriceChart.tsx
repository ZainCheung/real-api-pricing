import { useMemo, useState } from 'react'
import type { PricingPoint } from '../types'
import { useI18n } from '../lib/i18n'
import { vendorColor } from '../lib/vendors'
import { shortLabel } from '../lib/labels'
import { Pill, PillGroup } from './Pill'

const LIMITS = [25, 50, 97] as const

export function PriceChart({ points }: { points: PricingPoint[] }) {
  const { t, lang } = useI18n()
  const [limit, setLimit] = useState<(typeof LIMITS)[number]>(25)
  const [hoverId, setHoverId] = useState<string | null>(null)

  const data = useMemo(() => {
    return points
      .slice()
      .sort((a, b) => a.real_usd_per_mtok - b.real_usd_per_mtok)
      .slice(0, limit)
      .map((p) => ({
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

  // Log-scaled bar widths so cheap vs expensive remain readable
  const logVals = data.map((d) => Math.log10(Math.max(d.value, 1e-6)))
  const minL = Math.min(...logVals)
  const maxL = Math.max(...logVals)
  const span = maxL - minL || 1

  return (
    <div className="card chart-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink">{t('priceTitle')}</h3>
          <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">{t('priceSub')}</p>
        </div>
        <PillGroup>
          {LIMITS.map((n) => (
            <Pill key={n} active={limit === n} onClick={() => setLimit(n)}>
              {n === 97 ? t('allPoints') : `${t('showTop')} ${n}`}
            </Pill>
          ))}
        </PillGroup>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="bar-table min-w-[640px]">
          <thead>
            <tr>
              <th className="w-[38%]">{lang === 'zh' ? '套餐 × 模型' : 'Model'}</th>
              <th className="w-[42%]">{t('tooltipPrice')}</th>
              <th className="w-[20%] !pr-0 !text-right">$/MTok</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const pct = Math.max(2, ((logVals[i] - minL) / span) * 100)
              const active = hoverId === row.id
              const isApi = row.billing === 'metered'
              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => setHoverId(row.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className={active ? 'bg-white/[0.02]' : undefined}
                  title={`${row.label}\n${isApi ? 'API' : 'Sub'} · ${row.vendor} · $${row.value.toPrecision(4)}`}
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
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: row.color,
                          opacity: isApi ? 0.45 : active ? 1 : 0.88,
                          outline: isApi ? `1px solid ${row.color}` : undefined,
                          outlineOffset: '-1px',
                        }}
                      />
                    </div>
                  </td>
                  <td className="!pr-0 !text-right">
                    <span className="num text-[13px] text-ink">
                      ${row.value < 0.01 ? row.value.toPrecision(3) : row.value.toPrecision(4)}
                    </span>
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
