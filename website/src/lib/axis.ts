/** Nice log-price ticks and formatters for reversed $/MTok axes. */

const DECADES = [1e-4, 1e-3, 1e-2, 1e-1, 1, 10, 100]
const NICE = [
  1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2, 2e-2, 5e-2, 0.1, 0.2, 0.5, 1, 2, 5, 10, 100,
]

/**
 * Format a log-axis dollar tick as $0.01 / $0.1 / $1 / $10 (no trailing zeros,
 * no scientific notation, no float smudge).
 */
export function formatUsdTick(v: number): string {
  if (!Number.isFinite(v) || v <= 0) return ''
  if (v >= 10) return `$${Math.round(v)}`
  if (v >= 1) {
    const n = Number.isInteger(v) ? v : Number(v.toPrecision(2))
    return `$${n}`
  }
  const exp = Math.round(Math.log10(v))
  const decade = 10 ** exp
  if (Math.abs(v - decade) / v < 0.05) {
    const digits = Math.max(0, -exp)
    return `$${Number(v.toFixed(digits)) === 0 ? v.toFixed(digits) : parseFloat(v.toFixed(digits))}`
  }
  const digits = Math.max(1, Math.ceil(-Math.log10(v)))
  return `$${parseFloat(v.toFixed(Math.min(digits, 6)))}`
}

export function logPriceAxis(values: number[]): {
  domain: [number, number]
  ticks: number[]
} {
  const xs = values.filter((v) => Number.isFinite(v) && v > 0)
  if (!xs.length) {
    return { domain: [0.001, 1], ticks: [0.001, 0.01, 0.1, 1] }
  }

  const dataMin = Math.min(...xs)
  const dataMax = Math.max(...xs)
  let lo = dataMin / 1.5
  let hi = dataMax * 1.5

  const outerLo = [...DECADES].reverse().find((t) => t <= lo)
  const outerHi = DECADES.find((t) => t >= hi)
  if (outerLo && lo / outerLo < 10) lo = Math.min(lo, outerLo)
  if (outerHi) hi = Math.max(hi, outerHi)

  let ticks = DECADES.filter((t) => t >= lo * 0.999 && t <= hi * 1.001)
  if (ticks.length < 4) {
    ticks = NICE.filter((t) => t >= lo * 0.999 && t <= hi * 1.001)
  }
  if (ticks.length > 6) {
    const keep = new Set(DECADES.filter((t) => ticks.includes(t)))
    const extra = ticks.filter((t) => !keep.has(t))
    ticks = [...keep].sort((a, b) => a - b)
    for (const t of extra) {
      if (ticks.length >= 6) break
      ticks.push(t)
    }
    ticks.sort((a, b) => a - b)
  }
  if (ticks.length < 4) {
    ticks = NICE.filter((t) => t >= dataMin / 3 && t <= dataMax * 3).slice(0, 6)
  }
  if (!ticks.length) ticks = [dataMin, dataMax]

  return { domain: [lo, hi], ticks }
}

export function niceLinearTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return []
  if (min === max) return [min]
  const span = max - min
  const raw = span / Math.max(target - 1, 1)
  const mag = 10 ** Math.floor(Math.log10(Math.abs(raw)))
  const err = raw / mag
  let step = (err >= 7.5 ? 10 : err >= 3 ? 5 : err >= 1.5 ? 2 : 1) * mag

  const countFor = (s: number) => {
    const start = Math.ceil(min / s) * s
    let n = 0
    for (let t = start, i = 0; t <= max + s * 1e-6 && i < 16; t += s, i++) n++
    return n
  }
  while (countFor(step) < 4 && step > mag / 10) step /= 2
  while (countFor(step) > 6) step *= 2

  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let t = start, i = 0; t <= max + step * 1e-6 && i < 10; t += step, i++) {
    ticks.push(Number(t.toPrecision(12)))
  }
  return ticks.length ? ticks : [min, max]
}

/** 0–100% position on a log domain (cheap → expensive, left → right). */
export function logPosition(value: number, domain: [number, number]): number {
  const [lo, hi] = domain
  if (!(lo > 0) || !(hi > 0)) return 50
  const span = Math.log10(hi) - Math.log10(lo)
  if (!Number.isFinite(span) || span === 0) return 50
  const t = (Math.log10(Math.max(value, lo)) - Math.log10(lo)) / span
  return Math.min(100, Math.max(0, t * 100))
}

export function formatYTick(v: number): string {
  if (!Number.isFinite(v)) return ''
  const abs = Math.abs(v)
  if (abs >= 100) return String(Math.round(v))
  if (Number.isInteger(v)) return String(v)
  if (abs >= 10) return parseFloat(v.toFixed(1)).toString()
  return parseFloat(v.toPrecision(3)).toString()
}
