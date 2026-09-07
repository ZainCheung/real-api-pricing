import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { PointsPayload } from '../types'
import { computeInsights, computeStats } from '../lib/stats'
import { useI18n } from '../lib/i18n'
import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { StatStrip } from '../components/StatStrip'
import { CompareSection } from '../components/CompareSection'
import { LeaderboardChart } from '../components/LeaderboardChart'
import { ChartsSection } from '../components/ChartsSection'
import { AdvancedPareto } from '../components/AdvancedPareto'
import { Method } from '../components/Method'
import { Downloads } from '../components/Downloads'
import { Footer } from '../components/Footer'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { t } = useI18n()
  const [data, setData] = useState<PointsPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/points.json`
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json: PointsPayload) => setData(json))
      .catch((e: Error) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5 text-center">
        <div>
          <p className="text-lg text-ink">{t('error')}</p>
          <p className="mt-2 text-[13px] text-ink-muted">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
        {t('loading')}
      </div>
    )
  }

  const stats = computeStats(data)
  const insights = computeInsights(data)

  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      <main>
        <Hero stats={stats} insights={insights} />
        <StatStrip stats={stats} />
        <CompareSection data={data} />
        <section id="leaderboard" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {t('leaderboardTitle')}
            </h2>
            <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-ink-muted">
              {t('leaderboardSub')}
            </p>
          </div>
          <div className="mt-8">
            <LeaderboardChart points={data.points} boards={data.boards} />
          </div>
        </section>
        <ChartsSection data={data} />
        <AdvancedPareto data={data} />
        <Method mix={data.mix} />
        <Downloads />
      </main>
      <Footer />
    </div>
  )
}
