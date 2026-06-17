'use client'
import { useEffect, useState, type ReactNode } from 'react'
import { LangProvider } from '@/lib/i18n'
import { ToastProvider } from '@/lib/toast'
import { Masthead } from '@/components/layout/Masthead'
import { Tabs } from '@/components/layout/Tabs'
import { Footer } from '@/components/layout/Footer'
import type { Resume, SiteSettings } from '@/lib/types'
import type { Lang } from '@/lib/translations'

interface AppChromeProps {
  lang: Lang
  resume: Resume
  siteSettings: SiteSettings
  children: ReactNode
}

/**
 * Persistent UI shell shared by every route: masthead, tabs, footer, theme
 * toggle and toast host. Lives in the locale layout so it survives soft
 * navigations between /[lang], /[lang]/now and /[lang]/contact.
 */
export function AppChrome({ lang, resume, siteSettings, children }: AppChromeProps) {
  // Starts at a fixed value so the server and first client render agree (no
  // hydration mismatch). The real theme is applied to <html data-theme> by the
  // inline anti-flash script in the layout; this effect syncs React state to it
  // after hydration, hence the deliberate setState-in-effect.
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme')
    if (saved === 'dark' || saved === 'light') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(saved)
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light')
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  return (
    <LangProvider lang={lang}>
      <ToastProvider>
        <div className="shell">
          <Masthead
            resume={resume}
            theme={theme}
            onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            availabilityLabel={siteSettings.availabilityLabel}
            channels={siteSettings.channels}
            calendarUrl={siteSettings.calendarUrl}
          />
          <Tabs />
          <div>{children}</div>
          <Footer name={resume.basics.name} />
        </div>
      </ToastProvider>
    </LangProvider>
  )
}
