import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { SortKey } from '../lib/compare'
import { useI18n } from '../lib/i18n'
import { metricDef, type MetricDefinition } from '../lib/metrics'

export function MetricInfo({
  label,
  short,
  long,
  align = 'center',
}: {
  label: string
  short: string
  long?: string
  align?: 'start' | 'center' | 'end'
}) {
  const id = useId()
  const rootRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const hideTimer = useRef<number | null>(null)

  const clearHide = () => {
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }

  const show = () => {
    clearHide()
    setOpen(true)
  }

  const hide = () => {
    clearHide()
    hideTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => clearHide(), [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const alignClass =
    align === 'start' ? 'left-0 translate-x-0' : align === 'end' ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2'

  return (
    <span
      ref={rootRef}
      className="metric-info"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="metric-info-btn"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        ⓘ
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={`metric-info-tip ${alignClass}`}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <span className="block font-medium text-ink">{short}</span>
          {long ? <span className="mt-1 block text-ink-muted">{long}</span> : null}
        </span>
      ) : null}
    </span>
  )
}

export function MetricHelp({
  def,
  align,
  extra,
}: {
  def: MetricDefinition
  align?: 'start' | 'center' | 'end'
  extra?: string
}) {
  const { t } = useI18n()
  const long = extra ? `${t(def.longKey)} ${extra}` : t(def.longKey)
  return (
    <MetricInfo
      label={t('metricInfoLabel').replace('{metric}', t(def.titleKey))}
      short={t(def.shortKey)}
      long={def.sourceKey ? `${t(def.sourceKey)}. ${long}` : long}
      align={align}
    />
  )
}

export function SortMetricPill({
  active,
  onClick,
  metricKey,
  children,
}: {
  active: boolean
  onClick: () => void
  metricKey: SortKey
  children?: ReactNode
}) {
  const { t } = useI18n()
  const def = metricDef(metricKey)
  return (
    <span className={`pill ${active ? 'pill-active' : ''} gap-1`}>
      <button type="button" className="pill-core" aria-pressed={active} onClick={onClick}>
        {children ?? t(def.titleKey)}
      </button>
      <MetricHelp def={def} />
    </span>
  )
}

export function HeaderMetric({
  def,
  align = 'end',
}: {
  def: MetricDefinition
  align?: 'start' | 'center' | 'end'
}) {
  const { t } = useI18n()
  return (
    <span className="inline-flex items-center justify-end gap-0.5">
      {t(def.titleKey)}
      <MetricHelp def={def} align={align} />
    </span>
  )
}

