import { useI18n } from '../lib/i18n'
import type { PointsPayload } from '../types'

export function Method({ mix }: { mix: PointsPayload['mix'] }) {
  const { t } = useI18n()
  const steps = [
    { n: '01', title: t('method1Title'), body: t('method1Body') },
    { n: '02', title: t('method2Title'), body: t('method2Body') },
    { n: '03', title: t('method3Title'), body: t('method3Body') },
    { n: '04', title: t('method4Title'), body: t('method4Body') },
  ]

  return (
    <section id="method" className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {t('methodTitle')}
      </h2>
      <p className="mt-3 text-sm text-ink-muted">
        {t('mixLabel')}:{' '}
        <span className="num text-ink">
          {t('mixCache')} {(mix.cache * 100).toFixed(2)}% · {t('mixInput')}{' '}
          {(mix.input * 100).toFixed(2)}% · {t('mixOutput')} {(mix.output * 100).toFixed(2)}%
        </span>
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {steps.map((s) => (
          <article key={s.n} className="card card-hover p-6">
            <div className="num text-xs font-medium tracking-[0.2em] text-accent">{s.n}</div>
            <h3 className="mt-3 text-lg font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
