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
    <section id="data" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-xl font-semibold tracking-tight text-ink">{t('downloadTitle')}</h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {links.map((l) => (
            <a
              key={l.key}
              href={l.href}
              download
              className="rounded-md border border-border-strong bg-bg-elevated px-3.5 py-2 text-[13px] font-medium text-ink hover:border-neutral-500"
            >
              {t(l.key)}
            </a>
          ))}
          <a
            href="https://github.com/ZainCheung/real-api-pricing"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-transparent px-3.5 py-2 text-[13px] text-ink-muted hover:text-ink"
          >
            {t('github')} ↗
          </a>
        </div>
      </div>
    </section>
  )
}
