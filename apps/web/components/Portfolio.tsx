'use client'
import { useState, useEffect, useCallback } from 'react'
import { LangProvider, useLang } from '@/lib/i18n'
import { Toast } from '@/components/ui/Toast'
import { Masthead } from '@/components/layout/Masthead'
import { Tabs } from '@/components/layout/Tabs'
import { Footer } from '@/components/layout/Footer'
import { CVView } from '@/components/cv/CVView'
import { NowView } from '@/components/now/NowView'
import { ContactView } from '@/components/contact/ContactView'
import type { Resume, Now, SiteSettings } from '@/lib/types'
import type { Book } from '@/lib/goodreads'

type Tab = 'cv' | 'now' | 'contact'

interface PortfolioProps {
  resume: Resume
  now: Now
  books: Book[]
  asOf: string
  siteSettings: SiteSettings
}

function PortfolioInner({ resume, now, books, asOf, siteSettings }: PortfolioProps) {
  const { T } = useLang()

  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'cv'
    const h = window.location.hash.replace('#', '') as Tab
    return ['cv', 'now', 'contact'].includes(h) ? h : 'cv'
  })

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme')
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved)
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light')
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  useEffect(() => {
    if (window.location.hash !== `#${tab}`) {
      history.replaceState(null, '', `#${tab}`)
    }
  }, [tab])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [])

  const exportJSON = useCallback(() => {
    const data = JSON.stringify(resume, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bartosz-grabski-cv.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast(T.toasts.json)
  }, [resume, T, showToast])

  const printPDF = useCallback(() => {
    const prev = tab
    setTab('cv')
    setTimeout(() => { window.print(); setTab(prev) }, 120)
  }, [tab])

  return (
    <>
      <div className="shell">
        <Masthead
          resume={resume}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          availabilityLabel={siteSettings.availabilityLabel}
        />
        <Tabs tab={tab} onTabChange={setTab} />
        <div>
          {tab === 'cv' && (
            <CVView resume={resume} onExportJSON={exportJSON} onPrint={printPDF} />
          )}
          {tab === 'now' && <NowView now={now} books={books} asOf={asOf} />}
          {tab === 'contact' && <ContactView resume={resume} availabilityLabel={siteSettings.availabilityLabel} calendarUrl={siteSettings.calendarUrl} channels={siteSettings.channels} contact={siteSettings.contact} />}
        </div>
        <Footer name={resume.basics.name} />
      </div>
      <Toast message={toast} />
    </>
  )
}

export function Portfolio(props: PortfolioProps) {
  return (
    <LangProvider>
      <PortfolioInner {...props} />
    </LangProvider>
  )
}
