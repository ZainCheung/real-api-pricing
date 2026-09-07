import type { BoardKey, PricingPoint, PointsPayload } from '../types'

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
