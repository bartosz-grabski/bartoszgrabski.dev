'use client'
import { createContext, useContext, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { translations, type Lang, type Translations } from './translations'
import type { Bilingual } from './types'
import { swapLocale } from './site'

interface LangContextValue {
  lang: Lang
  /** Navigate to the equivalent page in the given locale (real URL change). */
  setLang: (lang: Lang) => void
  T: Translations // always the EN shape; both locales share identical keys
  t: (field?: Bilingual | null) => string
}

export const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  T: translations.en,
  t: (field) => field?.en ?? '',
})

export function useLang() {
  return useContext(LangContext)
}

/**
 * Locale now comes from the URL (`/en/...`, `/pl/...`), so there is no
 * detection or persistence here. Switching language is a navigation to the
 * equivalent path in the other locale.
 */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  function setLang(next: Lang) {
    router.push(swapLocale(pathname, next))
  }

  const T = translations[lang] as Translations
  const t = (field?: Bilingual | null) => (field ? field[lang] ?? field.en : '')

  return (
    <LangContext.Provider value={{ lang, setLang, T, t }}>
      {children}
    </LangContext.Provider>
  )
}
