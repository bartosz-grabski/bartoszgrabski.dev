'use client'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { resolveStrings, type Lang, type Translations } from './strings'
import type { Bilingual, UiStrings } from './types'
import { swapLocale } from './site'

interface LangContextValue {
  lang: Lang
  /** Navigate to the equivalent page in the given locale (real URL change). */
  setLang: (lang: Lang) => void
  T: Translations // resolved from the Sanity uiStrings document
  t: (field?: Bilingual | null) => string
}

export const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  T: resolveStrings(null, 'en'),
  t: (field) => field?.en ?? '',
})

export function useLang() {
  return useContext(LangContext)
}

/**
 * Locale comes from the URL (`/en/...`, `/pl/...`); UI labels come from the
 * Sanity uiStrings document fetched in the locale layout. Switching language
 * is a navigation to the equivalent path in the other locale.
 */
export function LangProvider({
  lang,
  strings = null,
  children,
}: {
  lang: Lang
  strings?: UiStrings | null
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  function setLang(next: Lang) {
    router.push(swapLocale(pathname, next))
  }

  const T = useMemo(() => resolveStrings(strings, lang), [strings, lang])
  const t = (field?: Bilingual | null) => (field ? field[lang] ?? field.en : '')

  return (
    <LangContext.Provider value={{ lang, setLang, T, t }}>
      {children}
    </LangContext.Provider>
  )
}
