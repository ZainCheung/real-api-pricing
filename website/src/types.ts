export type Billing = 'subscription' | 'metered'

export type BoardKey =
  | 'arena_code'
  | 'arena_agent_mode'
  | 'aa_intelligence_index'
  | 'aa_coding_agent_index'

export interface BoardMeta {
  name: string
  metric: string
  url: string
  snapshot: string
}

export interface PricingPoint {
  id: string
  plan: string
  billing: Billing
  model: string
  model_display: string
  vendor: string
  label: string
  price_usd: number | null
  monthly_yi: number | null
  real_usd_per_mtok: number
  list_blended_usd_per_mtok: number | null
  d: number | null
  confidence: string
  tier: string
  source: string
  note: string
  arena_code__score: number | null
  arena_code__variant: string | null
  arena_agent_mode__score: number | null
  arena_agent_mode__variant: string | null
  aa_intelligence_index__score: number | null
  aa_intelligence_index__variant: string | null
  aa_coding_agent_index__score: number | null
  aa_coding_agent_index__variant: string | null
  [key: string]: string | number | null
}

export interface PointsPayload {
  generatedAt: string
  mix: { cache: number; input: number; output: number }
  boards: Record<BoardKey, BoardMeta>
  points: PricingPoint[]
}

export type Lang = 'en' | 'zh'
