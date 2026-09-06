import { useI18n } from '../lib/i18n'

const base = import.meta.env.BASE_URL

const links = [
  { key: 'downloadJson' as const, href: `${base}data/points.json` },
  { key: 'downloadCsv' as const, href: `${base}data/points.csv` },
  { key: 'downloadAdopted' as const, href: `${base}data/adopted.csv` },
]

export function Downloads() {
  const { t } = useI18n()

  return (
    <section id="data" className="border-t border-border bg-bg-elevated/40">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">{t('downloadTitle')}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {links.map((l) => (
            <a
              key={l.key}
              href={l.href}
              download
              className="rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm font-medium text-ink hover:border-accent/50 hover:text-accent"
            >
              {t(l.key)}
            </a>
          ))}
          <a
            href="https://github.com/ZainCheung/real-api-pricing"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-ink-muted hover:text-ink"
          >
            {t('github')} ↗
          </a>
        </div>
      </div>
    </section>
  )
}
