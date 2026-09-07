import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Pill({
  active,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      {...rest}
      aria-pressed={Boolean(active)}
      className={`pill ${active ? 'pill-active' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export function PillGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-1.5">{children}</div>
}
