import type { BoardKey, PricingPoint } from '../types'

export function scoreKey(board: BoardKey): string {
  return `${board}__score`
}

export function variantKey(board: BoardKey): string {
  return `${board}__variant`
}

/** Classic maximize-score / minimize-price frontier (subscription only). */
export function subscriptionFrontier(
  points: PricingPoint[],
  board: BoardKey,
): PricingPoint[] {
  const key = scoreKey(board)
  const scored = points.filter(
    (p) =>
      p.billing === 'subscription' &&
      p[key] != null &&
      p.real_usd_per_mtok > 0,
  )

  const sorted = [...scored].sort(
    (a, b) =>
      a.real_usd_per_mtok - b.real_usd_per_mtok ||
      Number(b[key]) - Number(a[key]),
  )

  let best = -Infinity
  const frontier: PricingPoint[] = []
  for (const p of sorted) {
    const s = Number(p[key])
    if (s > best) {
      best = s
      frontier.push(p)
    }
  }
  return frontier
}

export function boardPoints(points: PricingPoint[], board: BoardKey): PricingPoint[] {
  const key = scoreKey(board)
  return points.filter((p) => p[key] != null && p.real_usd_per_mtok > 0)
}
