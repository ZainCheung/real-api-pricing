import { formatUsdTick } from '../lib/axis'

type TickProps = {
  x?: number
  y?: number
  payload?: { value: number }
  allowed?: number[]
}

function isAllowed(value: number, allowed?: number[]) {
  if (!allowed?.length) return true
  return allowed.some((t) => Math.abs(Math.log10(t) - Math.log10(value)) < 1e-4)
}

/** Renders only the sparse log-price ticks; drops Recharts extras that cause overlap. */
export function UsdAxisTick({ x = 0, y = 0, payload, allowed }: TickProps) {
  const v = payload?.value
  if (v == null || !Number.isFinite(v) || v <= 0 || !isAllowed(v, allowed)) return null
  const label = formatUsdTick(v)
  if (!label) return null
  return (
    <text
      x={x}
      y={y}
      dy={14}
      textAnchor="middle"
      fill="#a3a3a3"
      fontSize={12}
      fontFamily="Inter, system-ui, sans-serif"
    >
      {label}
    </text>
  )
}
