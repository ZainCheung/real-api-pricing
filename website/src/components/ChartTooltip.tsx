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
    <div className="rounded-md border border-border-strong bg-bg-elevated px-3 py-2.5 text-[13px] leading-snug shadow-xl">
      {children}
    </div>
  )
}
