import { useLang } from '@/lib/i18n'
import type { Resume, Bilingual } from '@/lib/types'

interface MastheadProps {
  resume: Resume
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  availabilityLabel: Bilingual
}

export function Masthead({ resume, theme, onToggleTheme, availabilityLabel }: MastheadProps) {
  const { lang, setLang, T, t } = useLang()
  const [first, ...rest] = resume.basics.name.split(' ')
  const otherLang = lang === 'en' ? 'pl' : 'en'

  return (
    <header className="masthead">
      <div className="left">
        <h1 className="name">
          {first} <em>{rest.join(' ')}</em>
        </h1>
        <p className="role">{T.role} · {T.location}</p>
      </div>
      <div className="right">
        <span className="avail">{t(availabilityLabel)}</span>
        <span>{resume.basics.url}</span>
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
