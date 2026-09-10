import { describe, expect, it } from 'vitest'
import type { PricingPoint } from '../types'
import {
  apiSavingRatio,
  filterPoints,
  formatApiSaving,
  groupByModel,
  pointScore,
  representativeForMetric,
  sortPoints,
} from './compare'
import { formatScore } from './format'

function point(partial: Partial<PricingPoint> & Pick<PricingPoint, 'id'>): PricingPoint {
  const plan = partial.plan ?? 'Plan'
  const modelDisplay = partial.model_display ?? 'Model A'
  return {
    plan,
    billing: 'subscription',
    model: 'model-a',
    model_display: modelDisplay,
    vendor: 'Vendor',
    label: `${modelDisplay} · ${plan}`,
    price_usd: 20,
    monthly_yi: 1,
    real_usd_per_mtok: 1,
    list_blended_usd_per_mtok: 10,
    d: null,
    confidence: 'high',
    tier: 'main',
    source: '',
    note: '',
    arena_code__score: null,
    arena_code__variant: null,
    arena_agent_mode__score: null,
    arena_agent_mode__variant: null,
    aa_intelligence_index__score: null,
    aa_intelligence_index__variant: null,
    aa_coding_agent_index__score: null,
    aa_coding_agent_index__variant: null,
    ...partial,
  }
}

describe('representative selection', () => {
  const cheapSmall = point({
    id: 'plan-a',
    plan: 'Plan A',
    real_usd_per_mtok: 0.01,
    monthly_yi: 20,
  })
  const dearLarge = point({
    id: 'plan-b',
    plan: 'Plan B',
    real_usd_per_mtok: 0.02,
    monthly_yi: 100,
  })

  it('uses the lowest real price when sorting by price', () => {
    expect(representativeForMetric([cheapSmall, dearLarge], 'price').id).toBe('plan-a')
    expect(groupByModel([cheapSmall, dearLarge], 'price')[0].best.id).toBe('plan-a')
  })

  it('uses the largest monthly allowance when sorting by allowance', () => {
    expect(representativeForMetric([cheapSmall, dearLarge], 'allowance').id).toBe('plan-b')
    expect(groupByModel([cheapSmall, dearLarge], 'allowance')[0].best.id).toBe('plan-b')
  })

  it('uses the cheapest scored plan when sorting by a board', () => {
    const scoredCheap = point({
      id: 'scored-cheap',
      plan: 'Scored cheap',
      real_usd_per_mtok: 0.03,
      arena_code__score: 1600,
    })
    const scoredDear = point({
      id: 'scored-dear',
      plan: 'Scored dear',
      real_usd_per_mtok: 0.04,
      arena_code__score: 1600,
    })
    const unscoredCheapest = point({
      id: 'unscored',
      plan: 'Unscored',
      real_usd_per_mtok: 0.005,
      arena_code__score: null,
    })
    const best = representativeForMetric(
      [unscoredCheapest, scoredDear, scoredCheap],
      'arena_code',
    )
    expect(best.id).toBe('scored-cheap')
  })
})

describe('missing scores', () => {
  it('formats missing scores as a dash, not zero', () => {
    expect(formatScore(null)).toBe('—')
    expect(formatScore(undefined)).toBe('—')
    expect(formatScore(0)).toBe('0')
    expect(pointScore(point({ id: 'none', arena_code__score: null }), 'arena_code')).toBeNull()
  })

  it('sorts board-missing points after scored points', () => {
    const missing = point({
      id: 'missing',
      arena_code__score: null,
      aa_intelligence_index__score: 50,
      real_usd_per_mtok: 0.01,
    })
    const scored = point({
      id: 'scored',
      arena_code__score: 40,
      real_usd_per_mtok: 0.5,
    })
    const sorted = sortPoints([missing, scored], 'arena_code')
    expect(sorted.map((p) => p.id)).toEqual(['scored', 'missing'])
    expect(formatScore(pointScore(sorted[1], 'arena_code'))).toBe('—')
  })
})

describe('confidence filter', () => {
  it('filters pricing records and leaves benchmark scores untouched', () => {
    const high = point({ id: 'high', confidence: 'high', arena_code__score: 10 })
    const low = point({ id: 'low', confidence: 'low', arena_code__score: 90 })
    const filtered = filterPoints([high, low], {
      query: '',
      billing: 'all',
      vendor: 'all',
      confidence: 'high',
    })
    expect(filtered.map((p) => p.id)).toEqual(['high'])
    expect(pointScore(low, 'arena_code')).toBe(90)
  })
})

describe('derived API savings', () => {
  it('reports 96% when real is 0.02 and list is 0.5', () => {
    const sub = point({
      id: 'sub',
      billing: 'subscription',
      real_usd_per_mtok: 0.02,
      list_blended_usd_per_mtok: 0.5,
    })
    const ratio = apiSavingRatio(sub)
    expect(ratio).toBeCloseTo(0.96)
    expect(formatApiSaving(ratio!)).toBe('96%')
  })

  it('does not compute savings for API baseline points', () => {
    const api = point({
      id: 'api',
      billing: 'metered',
      real_usd_per_mtok: 0.02,
      list_blended_usd_per_mtok: 0.5,
    })
    expect(apiSavingRatio(api)).toBeNull()
  })
})
