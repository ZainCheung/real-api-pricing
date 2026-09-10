import type { Lang } from '../types'

export function formatUsdPerMtok(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return '—'
  const body = n < 0.01 ? n.toPrecision(3) : n.toPrecision(4)
  return `$${body}`
}

export function formatMonthlyFee(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  if (Number.isInteger(n)) return `$${n}`
  return `$${n.toFixed(2)}`
}

/** monthly_yi is 亿 (1e8 tokens). EN shows billions of tokens (yi / 10). */
export function formatAllowanceYi(
  yi: number | null | undefined,
  lang: Lang,
  compact = false,
): string {
  if (yi == null || !Number.isFinite(yi) || yi <= 0) return '—'
  if (lang === 'zh') {
    const text = yi.toLocaleString('zh-CN', { maximumFractionDigits: yi >= 10 ? 1 : 3 })
    return `${text} 亿`
  }
  const billions = yi / 10
  const n = billions.toLocaleString('en-US', { maximumFractionDigits: billions >= 10 ? 1 : 3 })
  return compact ? `${n}B` : `${n}B tokens`
}

export function formatScore(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  if (Number.isInteger(n)) return String(n)
  return parseFloat(n.toPrecision(4)).toString()
}

export function formatSnapshotDate(iso: string, lang: Lang): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function extractSourceUrl(source: string): string | null {
  const m = source.match(/https?:\/\/[^\s]+/i)
  return m ? m[0].replace(/[),.;]+$/, '') : null
}
