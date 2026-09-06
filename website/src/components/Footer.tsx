import { useI18n } from '../lib/i18n'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-medium text-ink">{t('brand')}</div>
          <div className="mt-1">{t('footerLicense')}</div>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          <a
            className="hover:text-accent"
            href="https://github.com/ZainCheung/real-api-pricing/blob/main/SOURCES.md"
            target="_blank"
            rel="noreferrer"
          >
            {t('footerSources')}
          </a>
          <p className="max-w-md text-xs leading-relaxed sm:text-right">{t('footerNote')}</p>
        </div>
      </div>
    </footer>
  )
}
