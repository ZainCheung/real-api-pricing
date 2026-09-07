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

export function groupByModel(points: PricingPoint[]): ModelGroup[] {
  const map = new Map<string, PricingPoint[]>()
  for (const p of points) {
    const list = map.get(p.model) ?? []
    list.push(p)
    map.set(p.model, list)
  }
  const groups: ModelGroup[] = []
  for (const [model, plans] of map) {
    const priced = [...plans].sort((a, b) => a.real_usd_per_mtok - b.real_usd_per_mtok)
    const best = priced[0]
    groups.push({
      model,
      display: best.model_display,
      vendor: best.vendor,
      best,
      plans: priced,
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
