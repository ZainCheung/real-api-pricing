import type { PointsPayload } from '../types'
import { useI18n } from '../lib/i18n'
import { BOARD_KEYS } from '../lib/labels'
import { AllowanceChart } from './AllowanceChart'
import { PriceChart } from './PriceChart'
import { ParetoChart } from './ParetoChart'
import { LeaderboardChart } from './LeaderboardChart'

export function ChartsSection({ data }: { data: PointsPayload }) {
  const { t } = useI18n()

  return (
    <section id="charts" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {t('overviewTitle')}
        </h2>
        <p className="text-[12px] text-ink-dim">
          {data.points.length} points · {data.generatedAt}
        </p>
      </div>
      <div className="mt-8 space-y-5">
        <AllowanceChart points={data.points} />
        <PriceChart points={data.points} />
      </div>

      <div id="leaderboard" className="mt-16 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('leaderboardTitle')}
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-muted">
            {t('leaderboardSub')}
          </p>
        </div>
      </div>
      <div className="mt-8">
        <LeaderboardChart points={data.points} boards={data.boards} />
      </div>

      <div className="mt-16 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('paretoTitle')}
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-muted">
            {t('paretoSub')}
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {BOARD_KEYS.map((b) => (
          <ParetoChart key={b} board={b} meta={data.boards[b]} points={data.points} />
        ))}
      </div>
    </section>
  )
}
