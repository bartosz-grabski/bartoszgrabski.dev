'use client'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Lang, type Translations } from './translations'
import type { Bilingual } from './types'

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  T: Translations  // always the EN shape; both locales share identical keys
  t: (field: Bilingual) => string
}

export const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  T: translations.en,
  t: (field) => field.en,
})

export function useLang() {
  return useContext(LangContext)
}

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem('portfolio-lang')
  if (saved === 'en' || saved === 'pl') return saved
  return navigator.language.slice(0, 2).toLowerCase() === 'pl' ? 'pl' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    setLangState(detectLang())
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('portfolio-lang', l)
    document.documentElement.setAttribute('lang', l)
  }

  const T = translations[lang] as Translations
  const t = (field: Bilingual) => field[lang] ?? field.en

  return (
    <LangContext.Provider value={{ lang, setLang, T, t }}>
      {children}
    </LangContext.Provider>
  )
}
