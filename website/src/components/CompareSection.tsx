import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import type { BoardKey, PointsPayload, PricingPoint } from '../types'
import { useI18n, type DictKey } from '../lib/i18n'
import {
  CONFIDENCE_LEVELS,
  MAX_COMPARE,
  filterPoints,
  groupByModel,
  isBoardSort,
  pointScore,
  sortGroups,
  sortPoints,
  uniqueVendors,
  type BillingFilter,
  type CompareView,
  type ConfidenceFilter,
  type SortKey,
} from '../lib/compare'
import { BOARD_KEYS, boardTitle } from '../lib/labels'
import { formatAllowanceYi, formatScore, formatUsdPerMtok } from '../lib/format'
import { vendorColor } from '../lib/vendors'
import { Pill, PillGroup } from './Pill'
import { RowDetail } from './RowDetail'

function confidenceKey(value: string): DictKey | null {
  if (value === 'high') return 'confHigh'
  if (value === 'medium') return 'confMedium'
  if (value === 'low') return 'confLow'
  return null
}

function activateOnKey(e: KeyboardEvent, fn: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    fn()
  }
}

function CompareRow({
  point,
  nested,
  selected,
  scoreBoard,
  variantCount,
  expanded,
  onSelect,
  onToggleExpand,
}: {
  point: PricingPoint
  nested?: boolean
  selected: boolean
  scoreBoard: BoardKey
  variantCount?: number
  expanded?: boolean
  onSelect: () => void
  onToggleExpand?: () => void
}) {
  const { t, lang } = useI18n()
  const score = pointScore(point, scoreBoard)
  const confKey = confidenceKey(point.confidence)
  const isApi = point.billing === 'metered'
  const color = vendorColor(point.vendor)
  const showExpand = (variantCount ?? 0) > 1 && onToggleExpand

  return (
    <div
      tabIndex={0}
      aria-current={selected ? 'true' : undefined}
      aria-expanded={showExpand ? Boolean(expanded) : undefined}
      title={point.label}
      onClick={onSelect}
      onKeyDown={(e) => activateOnKey(e, onSelect)}
      className={`compare-row ${selected ? 'compare-row-active' : ''} ${nested ? 'compare-row-nested' : ''}`}
    >
      <div className="flex min-w-0 items-start gap-2">
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{
            background: isApi ? 'transparent' : color,
            boxShadow: isApi ? `inset 0 0 0 1.5px ${color}` : undefined,
          }}
        />
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-ink">
            {nested ? point.plan : point.model_display}
          </div>
          <div className="truncate text-[11px] text-ink-dim lg:hidden">
            {nested ? `${isApi ? t('billingApi') : t('billingSub')} · ${point.vendor}` : point.plan}
          </div>
        </div>
      </div>
      <div className="hidden min-w-0 sm:block">
        <div className="truncate text-[13px] text-ink">{nested ? point.vendor : point.plan}</div>
        <div className="truncate text-[11px] text-ink-dim">
          {isApi ? t('billingApi') : t('billingSub')}
          {nested ? '' : ` · ${point.vendor}`}
        </div>
      </div>
      <div className="num text-right text-[13px] text-ink">
        {formatUsdPerMtok(point.real_usd_per_mtok)}
      </div>
      <div className="num hidden text-right text-[13px] text-ink lg:block">
        {formatAllowanceYi(point.monthly_yi, lang, true)}
      </div>
      <div className="num hidden text-right text-[13px] text-ink lg:block">
        {formatScore(score)}
      </div>
      <div className="hidden text-right text-[10px] font-medium uppercase tracking-[0.08em] text-ink-dim lg:block">
        {confKey ? t(confKey) : point.confidence}
      </div>
      <div className="flex justify-end">
        {showExpand ? (
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-[11px] text-ink-dim hover:text-ink"
            aria-label={expanded ? t('collapsePlans') : t('expandPlans')}
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand?.()
            }}
          >
            {variantCount} {expanded ? '▴' : '▾'}
          </button>
        ) : (
          <span className="w-6" />
        )}
      </div>
    </div>
  )
}

export function CompareSection({ data }: { data: PointsPayload }) {
  const { t, lang } = useI18n()
  const [query, setQuery] = useState('')
  const [view, setView] = useState<CompareView>('models')
  const [sortKey, setSortKey] = useState<SortKey>('price')
  const [scoreBoard, setScoreBoard] = useState<BoardKey>('arena_code')
  const [billing, setBilling] = useState<BillingFilter>('all')
  const [vendor, setVendor] = useState('all')
  const [confidence, setConfidence] = useState<ConfidenceFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const vendors = useMemo(() => uniqueVendors(data.points), [data.points])

  const filtered = useMemo(
    () =>
      filterPoints(data.points, {
        query,
        billing,
        vendor,
        confidence,
      }),
    [data.points, query, billing, vendor, confidence],
  )

  const planRows = useMemo(() => sortPoints(filtered, sortKey), [filtered, sortKey])
  const modelGroups = useMemo(
    () => sortGroups(groupByModel(filtered), sortKey),
    [filtered, sortKey],
  )

  useEffect(() => {
    if (!selectedId) return
    if (typeof window === 'undefined' || !window.matchMedia('(max-width: 1023px)').matches) return
    document.getElementById('compare-detail-mobile')?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    })
  }, [selectedId])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selected = data.points.find((p) => p.id === selectedId) ?? null
  const comparePts = compareIds
    .map((id) => data.points.find((p) => p.id === id))
    .filter((p): p is PricingPoint => p != null)

  const onSort = (key: SortKey) => {
    setSortKey(key)
    if (isBoardSort(key)) setScoreBoard(key)
  }

  const toggleExpand = (model: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(model)) next.delete(model)
      else next.add(model)
      return next
    })
  }

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, id]
    })
  }

  const visibleCount = view === 'models' ? modelGroups.length : planRows.length

  return (
    <section
      id="compare"
      className={`mx-auto max-w-6xl px-5 py-16 sm:py-20 ${comparePts.length ? 'pb-48' : ''}`}
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {t('compareTitle')}
        </h2>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-muted">
          {t('compareSub')}
        </p>
      </div>

      <div className="mt-6">
        <label className="sr-only" htmlFor="compare-search">
          {t('searchPlaceholder')}
        </label>
        <input
          id="compare-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="search-input"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <PillGroup>
            <Pill active={view === 'models'} onClick={() => setView('models')}>
              {t('viewModels')}
            </Pill>
            <Pill active={view === 'plans'} onClick={() => setView('plans')}>
              {t('viewPlans')}
            </Pill>
          </PillGroup>
          <PillGroup>
            <Pill active={billing === 'all'} onClick={() => setBilling('all')}>
              {t('filterAll')}
            </Pill>
            <Pill active={billing === 'subscription'} onClick={() => setBilling('subscription')}>
              {t('billingSub')}
            </Pill>
            <Pill active={billing === 'metered'} onClick={() => setBilling('metered')}>
              {t('billingApi')}
            </Pill>
          </PillGroup>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <PillGroup>
            <Pill active={sortKey === 'price'} onClick={() => onSort('price')}>
              {t('sortPrice')}
            </Pill>
            <Pill active={sortKey === 'allowance'} onClick={() => onSort('allowance')}>
              {t('sortAllowance')}
            </Pill>
            {BOARD_KEYS.map((b) => (
              <Pill key={b} active={sortKey === b} onClick={() => onSort(b)}>
                {boardTitle(b, lang)}
              </Pill>
            ))}
          </PillGroup>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-2 text-[13px] text-ink-muted">
            <span className="text-[11px] uppercase tracking-[0.08em] text-ink-dim">
              {t('filterVendor')}
            </span>
            <select
              aria-label={t('filterVendor')}
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="rounded-full border border-border-strong bg-bg px-3 py-1.5 text-[13px] text-ink"
            >
              <option value="all">{t('filterAll')}</option>
              {vendors.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <PillGroup>
            <span className="self-center px-1 text-[11px] uppercase tracking-[0.08em] text-ink-dim">
              {t('filterConfidence')}
            </span>
            <Pill active={confidence === 'all'} onClick={() => setConfidence('all')}>
              {t('filterAll')}
            </Pill>
            {CONFIDENCE_LEVELS.map((c) => {
              const key = confidenceKey(c)
              return (
                <Pill key={c} active={confidence === c} onClick={() => setConfidence(c)}>
                  {key ? t(key) : c}
                </Pill>
              )
            })}
          </PillGroup>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="card overflow-hidden px-3 py-2 sm:px-4">
          <div className="compare-head">
            <div>{t('colModel')}</div>
            <div>{t('colPlan')}</div>
            <div className="text-right">{t('colPrice')}</div>
            <div className="text-right">{t('colAllowance')}</div>
            <div className="text-right">{boardTitle(scoreBoard, lang)}</div>
            <div className="text-right">{t('colConfidence')}</div>
            <div />
          </div>
          {visibleCount === 0 ? (
            <p className="px-1 py-8 text-center text-[13px] text-ink-dim">{t('noResults')}</p>
          ) : view === 'models' ? (
            modelGroups.map((g) => {
              const open = expanded.has(g.model)
              const rest = g.plans.filter((p) => p.id !== g.best.id)
              return (
                <div key={g.model}>
                  <CompareRow
                    point={g.best}
                    selected={selectedId === g.best.id}
                    scoreBoard={scoreBoard}
                    variantCount={g.plans.length}
                    expanded={open}
                    onSelect={() => setSelectedId((id) => (id === g.best.id ? null : g.best.id))}
                    onToggleExpand={() => toggleExpand(g.model)}
                  />
                  {open
                    ? rest.map((p) => (
                        <CompareRow
                          key={p.id}
                          point={p}
                          nested
                          selected={selectedId === p.id}
                          scoreBoard={scoreBoard}
                          onSelect={() => setSelectedId((id) => (id === p.id ? null : p.id))}
                        />
                      ))
                    : null}
                </div>
              )
            })
          ) : (
            planRows.map((p) => (
              <CompareRow
                key={p.id}
                point={p}
                selected={selectedId === p.id}
                scoreBoard={scoreBoard}
                onSelect={() => setSelectedId((id) => (id === p.id ? null : p.id))}
              />
            ))
          )}
        </div>

        <div className="hidden lg:block">
          <RowDetail
            point={selected}
            scoreBoard={scoreBoard}
            inCompare={selected ? compareIds.includes(selected.id) : false}
            compareFull={compareIds.length >= MAX_COMPARE}
            onToggleCompare={() => {
              if (selected) toggleCompare(selected.id)
            }}
            onClose={() => setSelectedId(null)}
          />
        </div>
      </div>

      {selected ? (
        <div id="compare-detail-mobile" className="mt-3 lg:hidden">
          <RowDetail
            point={selected}
            scoreBoard={scoreBoard}
            inCompare={compareIds.includes(selected.id)}
            compareFull={compareIds.length >= MAX_COMPARE}
            onToggleCompare={() => toggleCompare(selected.id)}
            onClose={() => setSelectedId(null)}
          />
        </div>
      ) : null}

      {comparePts.length > 0 ? (
        <div className="compare-tray" role="region" aria-label={t('compareTray')}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-2.5">
            <div className="text-[13px] text-ink-muted">
              <span className="num text-ink">{comparePts.length}</span> {t('compareSelected')}
            </div>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-[13px] text-ink-dim hover:text-ink"
            >
              {t('clearCompare')}
            </button>
          </div>
          <div className="mx-auto grid max-w-6xl gap-2 px-5 pb-3 sm:grid-cols-2 lg:grid-cols-4">
            {comparePts.map((p) => (
              <div key={p.id} className="rounded-md border border-border px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-ink">{p.model_display}</div>
                    <div className="truncate text-[11px] text-ink-dim">{p.plan}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompare(p.id)}
                    className="shrink-0 text-[11px] text-ink-dim hover:text-ink"
                  >
                    {t('removeFromCompare')}
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                  <span className="text-ink-dim">{t('colPrice')}</span>
                  <span className="num text-right text-ink">{formatUsdPerMtok(p.real_usd_per_mtok)}</span>
                  <span className="text-ink-dim">{t('colAllowance')}</span>
                  <span className="num text-right text-ink">
                    {formatAllowanceYi(p.monthly_yi, lang, true)}
                  </span>
                  <span className="text-ink-dim">{t('colScore')}</span>
                  <span className="num text-right text-ink">
                    {formatScore(pointScore(p, scoreBoard))}
                  </span>
                  <span className="text-ink-dim">{t('colConfidence')}</span>
                  <span className="text-right uppercase tracking-wide text-ink">
                    {confidenceKey(p.confidence) ? t(confidenceKey(p.confidence)!) : p.confidence}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
