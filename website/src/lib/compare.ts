import type { Billing, BoardKey, PricingPoint } from '../types'
import { BOARD_KEYS } from './labels'
import { scoreKey } from './pareto'

export type CompareView = 'models' | 'plans'
export type SortKey = 'price' | 'allowance' | BoardKey
export type BillingFilter = 'all' | Billing
export type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low'

export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const
export const MAX_COMPARE = 4

export function isBoardSort(key: SortKey): key is BoardKey {
  return (BOARD_KEYS as string[]).includes(key)
}

export function filterPoints(
  points: PricingPoint[],
  opts: {
    query: string
    billing: BillingFilter
    vendor: string
    confidence: ConfidenceFilter
  },
): PricingPoint[] {
  const q = opts.query.trim().toLowerCase()
  return points.filter((p) => {
    if (opts.billing !== 'all' && p.billing !== opts.billing) return false
    if (opts.vendor !== 'all' && p.vendor !== opts.vendor) return false
    if (opts.confidence !== 'all' && p.confidence !== opts.confidence) return false
    if (!q) return true
    const hay = `${p.model_display} ${p.model} ${p.plan} ${p.label} ${p.vendor}`.toLowerCase()
    return hay.includes(q)
  })
}

function metric(p: PricingPoint, sort: SortKey): number | null {
  if (sort === 'price') return p.real_usd_per_mtok
  if (sort === 'allowance') return p.monthly_yi
  const s = p[scoreKey(sort)]
  return typeof s === 'number' ? s : null
}

function byPriceThenLabel(a: PricingPoint, b: PricingPoint): number {
  return a.real_usd_per_mtok - b.real_usd_per_mtok || a.label.localeCompare(b.label)
}

/** Pick the plan that should represent a model for the active sort metric. */
export function representativeForMetric(plans: PricingPoint[], sort: SortKey): PricingPoint {
  if (plans.length === 1) return plans[0]

  if (sort === 'allowance') {
    const withAllowance = plans.filter((p) => p.monthly_yi != null && Number.isFinite(p.monthly_yi))
    const pool = withAllowance.length ? withAllowance : plans
    return [...pool].sort(
      (a, b) =>
        (b.monthly_yi ?? -Infinity) - (a.monthly_yi ?? -Infinity) || byPriceThenLabel(a, b),
    )[0]
  }

  if (isBoardSort(sort)) {
    const scored = plans.filter((p) => metric(p, sort) != null)
    const pool = scored.length ? scored : plans
    return [...pool].sort(byPriceThenLabel)[0]
  }

  return [...plans].sort(byPriceThenLabel)[0]
}

export function sortPoints(points: PricingPoint[], sort: SortKey): PricingPoint[] {
  const dir = sort === 'price' ? 1 : -1
  return [...points].sort((a, b) => {
    const va = metric(a, sort)
    const vb = metric(b, sort)
    if (va == null && vb == null) return a.label.localeCompare(b.label)
    if (va == null) return 1
    if (vb == null) return -1
    if (va !== vb) return (va - vb) * dir
    return a.real_usd_per_mtok - b.real_usd_per_mtok || a.label.localeCompare(b.label)
  })
}

export type ModelGroup = {
  model: string
  display: string
  vendor: string
  best: PricingPoint
  plans: PricingPoint[]
}

export function groupByModel(points: PricingPoint[], sortKey: SortKey = 'price'): ModelGroup[] {
  const map = new Map<string, PricingPoint[]>()
  for (const p of points) {
    const list = map.get(p.model) ?? []
    list.push(p)
    map.set(p.model, list)
  }
  const groups: ModelGroup[] = []
  for (const [model, plans] of map) {
    const best = representativeForMetric(plans, sortKey)
    const ordered = sortPoints(plans, sortKey)
    groups.push({
      model,
      display: best.model_display,
      vendor: best.vendor,
      best,
      plans: ordered,
    })
  }
  return groups
}

export function sortGroups(groups: ModelGroup[], sort: SortKey): ModelGroup[] {
  const dir = sort === 'price' ? 1 : -1
  return [...groups].sort((a, b) => {
    const va = metric(a.best, sort)
    const vb = metric(b.best, sort)
    if (va == null && vb == null) return a.display.localeCompare(b.display)
    if (va == null) return 1
    if (vb == null) return -1
    if (va !== vb) return (va - vb) * dir
    return a.best.real_usd_per_mtok - b.best.real_usd_per_mtok
  })
}

export function uniqueVendors(points: PricingPoint[]): string[] {
  return [...new Set(points.map((p) => p.vendor))].sort((a, b) => a.localeCompare(b))
}

export function pointScore(p: PricingPoint, board: BoardKey): number | null {
  const s = p[scoreKey(board)]
  return typeof s === 'number' ? s : null
}

/** Subscription saving vs list blended API price. Null for API points or missing list price. */
export function apiSavingRatio(point: PricingPoint): number | null {
  if (point.billing === 'metered') return null
  const list = point.list_blended_usd_per_mtok
  if (list == null || !(list > 0) || !Number.isFinite(point.real_usd_per_mtok)) return null
  return 1 - point.real_usd_per_mtok / list
}

export function formatApiSaving(ratio: number): string {
  const pct = Math.round(ratio * 1000) / 10
  if (Number.isInteger(pct)) return `${pct}%`
  return `${pct.toFixed(1)}%`
}
