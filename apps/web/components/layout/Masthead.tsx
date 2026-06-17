import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import { sectionFromPath } from '@/lib/site'
import type { Resume, Bilingual, Channel } from '@/lib/types'

interface MastheadProps {
  resume: Resume
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  availabilityLabel: Bilingual
  channels?: Channel[]
  calendarUrl?: string
}

/** "https://www.linkedin.com/in/x" → "linkedin.com/in/x" */
function handle(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '') + (u.pathname === '/' ? '' : u.pathname)
  } catch {
    return url
  }
}

export function Masthead({ resume, theme, onToggleTheme, availabilityLabel, channels, calendarUrl }: MastheadProps) {
  const { lang, setLang, T, t } = useLang()
  const pathname = usePathname()
  const [first, ...rest] = resume.basics.name.split(' ')
  const otherLang = lang === 'en' ? 'pl' : 'en'

  // The name is the page's <h1> on the CV index, where the person *is* the
  // topic. On the Now/Contact sub-pages it's just site branding, so it drops to
  // a <p> and each sub-page supplies its own descriptive <h1>.
  const NameTag = sectionFromPath(pathname) === '' ? 'h1' : 'p'

  const printContacts = [
    resume.basics.email,
    ...(channels ?? []).map(c => handle(c.url)),
    ...(calendarUrl ? [handle(calendarUrl)] : []),
  ]

  return (
    <header className="masthead">
      <div className="left">
        <NameTag className="name">
          {first} <em>{rest.join(' ')}</em>
        </NameTag>
        <p className="role">{T.role} · {T.location}</p>
      </div>
      <div className="right">
        <span className="avail">{t(availabilityLabel)}</span>
        <span>{resume.basics.url}</span>
        <ul className="print-contacts print-only">
          {printContacts.map(c => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="header-actions no-print">
          <button
            className="theme-toggle"
            onClick={() => setLang(otherLang)}
            aria-label={`Switch to ${otherLang.toUpperCase()}`}
          >
            <span className="lang-pill">
              <span className={lang === 'en' ? 'on' : ''}>EN</span>
              <span className="sep">/</span>
              <span className={lang === 'pl' ? 'on' : ''}>PL</span>
            </span>
          </button>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle colour theme"
          >
            {theme === 'dark' ? T.themeDark : T.themeLight}
          </button>
        </div>
      </div>
    </header>
  )
}
