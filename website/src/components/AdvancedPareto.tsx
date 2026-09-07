import { useState } from 'react'
import type { BoardKey, PointsPayload } from '../types'
import { useI18n } from '../lib/i18n'
import { BOARD_KEYS, boardTitle } from '../lib/labels'
import { ParetoChart } from './ParetoChart'
import { Pill, PillGroup } from './Pill'

export function AdvancedPareto({ data }: { data: PointsPayload }) {
  const { t, lang } = useI18n()
  const [board, setBoard] = useState<BoardKey>('arena_code')
  const [showAll, setShowAll] = useState(false)

  return (
    <section id="pareto" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t('advancedTitle')}
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-muted">
            {t('paretoSub')}
          </p>
        </div>
        <Pill
          active={showAll}
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? t('showOneBoard') : t('showAllBoards')}
        </Pill>
      </div>

      {showAll ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {BOARD_KEYS.map((b) => (
            <ParetoChart key={b} board={b} meta={data.boards[b]} points={data.points} />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6">
            <PillGroup>
              {BOARD_KEYS.map((b) => (
                <Pill key={b} active={board === b} onClick={() => setBoard(b)}>
                  {boardTitle(b, lang)}
                </Pill>
              ))}
            </PillGroup>
          </div>
          <div className="mt-5">
            <ParetoChart board={board} meta={data.boards[board]} points={data.points} />
          </div>
        </>
      )}
    </section>
  )
}
