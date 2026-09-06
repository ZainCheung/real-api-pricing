import type { PointsPayload } from '../types'
import { useI18n } from '../lib/i18n'
import { AllowanceChart } from './AllowanceChart'
import { PriceChart } from './PriceChart'
import { ParetoChart } from './ParetoChart'
import type { BoardKey } from '../types'

const BOARDS: BoardKey[] = [
  'arena_code',
  'arena_agent_mode',
  'aa_intelligence_index',
  'aa_coding_agent_index',
]

export function ChartsSection({ data }: { data: PointsPayload }) {
  const { t } = useI18n()

  return (
    <section id="charts" className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {t('overviewTitle')}
      </h2>
      <div className="mt-8 space-y-6">
        <AllowanceChart points={data.points} />
        <PriceChart points={data.points} />
      </div>

      <h2 className="mt-16 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {t('paretoTitle')}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('paretoSub')}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {BOARDS.map((b) => (
          <ParetoChart key={b} board={b} meta={data.boards[b]} points={data.points} />
        ))}
      </div>
    </section>
  )
}
