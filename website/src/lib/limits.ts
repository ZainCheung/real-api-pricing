export type ChartLimit = 15 | 30 | 'all'

export const CHART_LIMITS: readonly ChartLimit[] = [15, 30, 'all']

export function applyLimit<T>(rows: T[], limit: ChartLimit): T[] {
  if (limit === 'all') return rows
  return rows.slice(0, limit)
}

export function chartLimitKey(limit: ChartLimit): 'limitTop15' | 'limitTop30' | 'limitAll' {
  if (limit === 'all') return 'limitAll'
  if (limit === 15) return 'limitTop15'
  return 'limitTop30'
}

/** Bar width on a log scale, floored so the smallest value stays visible. */
export function logWidthPct(value: number, min: number, max: number, floor = 1.5): number {
  const lv = Math.log10(Math.max(value, 1e-9))
  const lmin = Math.log10(Math.max(min, 1e-9))
  const lmax = Math.log10(Math.max(max, 1e-9))
  const span = lmax - lmin
  if (!Number.isFinite(span) || span <= 0) return 50
  return Math.max(floor, ((lv - lmin) / span) * 100)
}
