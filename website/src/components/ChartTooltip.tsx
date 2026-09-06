import type { ReactNode } from 'react'

export function ChartTooltipShell({
  active,
  children,
}: {
  active?: boolean
  children: ReactNode
}) {
  if (!active) return null
  return (
    <div className="rounded-xl border border-border-strong bg-bg-elevated/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {children}
    </div>
  )
}
