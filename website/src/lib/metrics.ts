import type { BoardKey } from '../types'
import type { SortKey } from './compare'
import type { DictKey } from './i18n'
import { BOARD_KEYS } from './labels'

export type MetricDirection = 'higher' | 'lower'

export type MetricDefinition = {
  key: SortKey
  titleKey: DictKey
  shortKey: DictKey
  longKey: DictKey
  direction: MetricDirection
  sourceKey?: DictKey
}

export const PRICE_METRIC: MetricDefinition = {
  key: 'price',
  titleKey: 'sortPrice',
  shortKey: 'metricPriceShort',
  longKey: 'metricPriceLong',
  direction: 'lower',
}

export const ALLOWANCE_METRIC: MetricDefinition = {
  key: 'allowance',
  titleKey: 'sortAllowance',
  shortKey: 'metricAllowanceShort',
  longKey: 'metricAllowanceLong',
  direction: 'higher',
}

export const BOARD_METRICS: Record<BoardKey, MetricDefinition> = {
  arena_code: {
    key: 'arena_code',
    titleKey: 'boardArenaCode',
    shortKey: 'metricArenaCodeShort',
    longKey: 'metricArenaCodeLong',
    direction: 'higher',
  },
  arena_agent_mode: {
    key: 'arena_agent_mode',
    titleKey: 'boardArenaAgent',
    shortKey: 'metricArenaAgentShort',
    longKey: 'metricArenaAgentLong',
    direction: 'higher',
  },
  aa_intelligence_index: {
    key: 'aa_intelligence_index',
    titleKey: 'boardAAIntel',
    shortKey: 'metricAAIntelShort',
    longKey: 'metricAAIntelLong',
    direction: 'higher',
    sourceKey: 'aaIntelFullName',
  },
  aa_coding_agent_index: {
    key: 'aa_coding_agent_index',
    titleKey: 'boardAACoding',
    shortKey: 'metricAACodingShort',
    longKey: 'metricAACodingLong',
    direction: 'higher',
  },
}

export const SORT_METRICS: Record<SortKey, MetricDefinition> = {
  price: PRICE_METRIC,
  allowance: ALLOWANCE_METRIC,
  ...BOARD_METRICS,
}

export function metricDef(key: SortKey): MetricDefinition {
  return SORT_METRICS[key]
}

export function boardMetric(board: BoardKey): MetricDefinition {
  return BOARD_METRICS[board]
}

export const ALL_BOARD_METRICS: MetricDefinition[] = BOARD_KEYS.map((k) => BOARD_METRICS[k])
