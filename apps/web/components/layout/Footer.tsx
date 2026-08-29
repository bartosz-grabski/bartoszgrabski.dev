import { useLang } from '@/lib/i18n'

interface FooterProps {
  name: string
  /** ISO timestamp of the build — the static site is only ever as fresh as its last build. */
  lastUpdated: string
}

export function Footer({ name, lastUpdated }: FooterProps) {
  const { T, lang } = useLang()
  const updated = new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(lastUpdated))
  return (
    <footer className="footer">
      <span>{T.footer.copy(new Date().getFullYear(), name)}</span>
      <span>{T.footer.built.replace('{date}', updated)}</span>
    </footer>
  )
}
