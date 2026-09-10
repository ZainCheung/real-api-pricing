import type { BoardKey, PricingPoint, PointsPayload } from '../types'
import { subscriptionFrontier } from './pareto'

export interface SnapshotStats {
  generatedAt: string
  total: number
  subscription: number
  metered: number
  opencodeGo: number
  arenaCode: number
  arenaAgent: number
  aaIntel: number
  aaCoding: number
  vendors: number
}

export function computeStats(data: PointsPayload): SnapshotStats {
  const pts = data.points
  const scored = (k: BoardKey) =>
    pts.filter((p) => p[`${k}__score`] != null).length

  return {
    generatedAt: data.generatedAt,
    total: pts.length,
    subscription: pts.filter((p) => p.billing === 'subscription').length,
    metered: pts.filter((p) => p.billing === 'metered').length,
    opencodeGo: pts.filter((p) => p.plan.includes('OpenCode Go')).length,
    arenaCode: scored('arena_code'),
    arenaAgent: scored('arena_agent_mode'),
    aaIntel: scored('aa_intelligence_index'),
    aaCoding: scored('aa_coding_agent_index'),
    vendors: new Set(pts.map((p) => p.vendor)).size,
  }
}

export function subscriptionPoints(points: PricingPoint[]): PricingPoint[] {
  return points.filter(
    (p) => p.billing === 'subscription' && p.monthly_yi != null && p.monthly_yi > 0,
  )
}

export interface QuickInsights {
  lowest: PricingPoint | null
  largest: PricingPoint | null
  frontier: PricingPoint | null
}

/** Frontier example is the highest-score Code Arena subscription Pareto point. */
export function computeInsights(data: PointsPayload): QuickInsights {
  const pts = data.points
  if (!pts.length) return { lowest: null, largest: null, frontier: null }

  const lowest = pts.reduce((a, b) =>
    a.real_usd_per_mtok <= b.real_usd_per_mtok ? a : b,
  )
  const subs = subscriptionPoints(pts)
  const largest = subs.length
    ? subs.reduce((a, b) => ((a.monthly_yi ?? 0) >= (b.monthly_yi ?? 0) ? a : b))
    : null
  const frontierPts = subscriptionFrontier(pts, 'arena_code')
  const frontier = frontierPts.length ? frontierPts[frontierPts.length - 1] : null
  return { lowest, largest, frontier }
}
