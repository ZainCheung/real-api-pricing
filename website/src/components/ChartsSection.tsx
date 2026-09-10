import type { PointsPayload } from '../types'
import { useI18n } from '../lib/i18n'
import { AllowanceChart } from './AllowanceChart'
import { PriceChart } from './PriceChart'

export function ChartsSection({ data }: { data: PointsPayload }) {
  const { t } = useI18n()

  return (
    <section id="overview" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {t('overviewTitle')}
        </h2>
      </div>
      <div className="mt-8 space-y-5">
        <AllowanceChart points={data.points} />
        <PriceChart points={data.points} />
      </div>
    </section>
  )
}
