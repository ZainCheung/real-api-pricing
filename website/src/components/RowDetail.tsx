import type { ReactNode } from 'react'
import type { BoardKey, PricingPoint } from '../types'
import { useI18n, type DictKey } from '../lib/i18n'
import {
  extractSourceUrl,
  formatAllowanceYi,
  formatMonthlyFee,
  formatScore,
  formatUsdPerMtok,
} from '../lib/format'
import { pointScore } from '../lib/compare'
import { vendorColor } from '../lib/vendors'
import { boardTitle } from '../lib/labels'

function confidenceKey(value: string): DictKey | null {
  if (value === 'high') return 'confHigh'
  if (value === 'medium') return 'confMedium'
  if (value === 'low') return 'confLow'
  return null
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2 py-1.5 text-[13px]">
      <dt className="text-ink-dim">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  )
}

export function RowDetail({
  point,
  scoreBoard,
  inCompare,
  compareFull,
  onToggleCompare,
  onClose,
}: {
  point: PricingPoint | null
  scoreBoard: BoardKey
  inCompare: boolean
  compareFull: boolean
  onToggleCompare: () => void
  onClose: () => void
}) {
  const { t, lang } = useI18n()

  if (!point) {
    return (
      <aside className="card h-fit p-5 text-[13px] text-ink-dim">
        <div className="text-[11px] font-medium uppercase tracking-[0.12em]">{t('detailTitle')}</div>
        <p className="mt-2 leading-relaxed">{t('detailHint')}</p>
      </aside>
    )
  }

  const confKey = confidenceKey(point.confidence)
  const sourceUrl = extractSourceUrl(point.source)
  const score = pointScore(point, scoreBoard)
  const compareDisabled = !inCompare && compareFull

  return (
    <aside className="card h-fit p-5 lg:sticky lg:top-16">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-dim">
            {t('detailTitle')}
          </div>
          <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">
            {point.model_display}
          </h3>
          <p className="mt-0.5 text-[13px] text-ink-muted">{point.plan}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-[12px] text-ink-dim hover:text-ink"
        >
          {t('closeDetail')}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-muted">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: point.billing === 'metered' ? 'transparent' : vendorColor(point.vendor),
            boxShadow:
              point.billing === 'metered' ? `inset 0 0 0 1.5px ${vendorColor(point.vendor)}` : undefined,
          }}
        />
        {point.vendor}
        <span className="text-ink-dim">·</span>
        {point.billing === 'metered' ? t('billingApi') : t('billingSub')}
      </div>

      <dl className="mt-4 border-t border-border pt-3">
        <Field label={t('fieldRealPrice')}>
          <span className="num">
            {formatUsdPerMtok(point.real_usd_per_mtok)}
            <span className="text-ink-dim"> {t('perMtok')}</span>
          </span>
        </Field>
        <Field label={t('fieldMonthlyFee')}>
          <span className="num">{formatMonthlyFee(point.price_usd)}</span>
        </Field>
        <Field label={t('fieldUsableTokens')}>
          <span className="num">{formatAllowanceYi(point.monthly_yi, lang)}</span>
        </Field>
        {point.list_blended_usd_per_mtok != null ? (
          <Field label={t('fieldListPrice')}>
            <span className="num">
              {formatUsdPerMtok(point.list_blended_usd_per_mtok)}
              <span className="text-ink-dim"> {t('perMtok')}</span>
            </span>
          </Field>
        ) : null}
        <Field label={boardTitle(scoreBoard, lang)}>
          <span className="num">{formatScore(score)}</span>
        </Field>
        <Field label={t('fieldConfidence')}>
          <span className="uppercase tracking-wide">{confKey ? t(confKey) : point.confidence}</span>
        </Field>
        <Field label={t('fieldTier')}>{point.tier || '—'}</Field>
        <Field label={t('fieldVendor')}>{point.vendor}</Field>
        <Field label={t('fieldBilling')}>
          {point.billing === 'metered' ? t('billingApi') : t('billingSub')}
        </Field>
        <Field label={t('fieldSource')}>
          <div className="space-y-1">
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink underline decoration-border underline-offset-2 hover:decoration-ink"
              >
                {t('viewSource')} ↗
              </a>
            ) : null}
            <span className="block text-[12px] leading-snug text-ink-muted">
              {point.source || '—'}
            </span>
          </div>
        </Field>
        {point.note ? (
          <Field label={t('fieldNote')}>
            <span className="text-[12px] leading-snug text-ink-muted">{point.note}</span>
          </Field>
        ) : null}
      </dl>

      <button
        type="button"
        onClick={onToggleCompare}
        disabled={compareDisabled}
        title={compareDisabled ? t('compareFull') : undefined}
        className="mt-4 w-full rounded-md border border-border-strong px-3 py-2 text-[13px] font-medium text-ink hover:border-neutral-500 disabled:cursor-not-allowed disabled:text-ink-dim"
      >
        {inCompare ? t('removeFromCompare') : t('addToCompare')}
      </button>
    </aside>
  )
}
