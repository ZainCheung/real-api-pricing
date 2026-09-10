import type { BoardKey, Lang } from '../types'

export const BOARD_KEYS: BoardKey[] = [
  'arena_code',
  'arena_agent_mode',
  'aa_intelligence_index',
  'aa_coding_agent_index',
]

export function boardTitle(board: BoardKey, lang: Lang): string {
  const zh: Record<BoardKey, string> = {
    arena_code: 'Code Arena · WebDev',
    arena_agent_mode: 'Agent Arena',
    aa_intelligence_index: 'AA 智力榜',
    aa_coding_agent_index: 'AA 编程 Agent',
  }
  const en: Record<BoardKey, string> = {
    arena_code: 'Code Arena · WebDev',
    arena_agent_mode: 'Agent Arena',
    aa_intelligence_index: 'AA Intelligence',
    aa_coding_agent_index: 'AA Coding Agent',
  }
  return (lang === 'zh' ? zh : en)[board]
}

/** Shorten long "Model · Plan" labels for axes / dense charts. Full name stays in tooltip. */
export function shortLabel(label: string, max = 34): string {
  const cleaned = label.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned

  const parts = cleaned.split(' · ')
  if (parts.length >= 2) {
    const model = parts[0]
    let plan = parts.slice(1).join(' · ')
    // Drop parenthetical noise first
    plan = plan.replace(/\s*\([^)]*\)/g, '').trim()
    const candidate = `${model} · ${plan}`
    if (candidate.length <= max) return candidate
    if (model.length <= max - 2) {
      const room = max - model.length - 3
      if (room >= 6) return `${model} · ${plan.slice(0, room)}…`
      return model.length > max ? `${model.slice(0, max - 1)}…` : model
    }
  }
  return `${cleaned.slice(0, max - 1)}…`
}

/** Even shorter name for scatter point labels (model-ish). */
export function scatterLabel(label: string, max = 22): string {
  const model = label.split(' · ')[0]?.trim() || label
  if (model.length <= max) return model
  return `${model.slice(0, max - 1)}…`
}
