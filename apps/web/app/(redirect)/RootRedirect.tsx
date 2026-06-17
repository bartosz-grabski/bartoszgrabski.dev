'use client'
import { useEffect } from 'react'
import { locales, defaultLocale, localePath, isLocale } from '@/lib/site'

/** Redirects '/' to the visitor's preferred locale, falling back to the default. */
export function RootRedirect() {
  useEffect(() => {
    const stored = localStorage.getItem('portfolio-lang')
    const fromNav = navigator.language.slice(0, 2).toLowerCase()
    const target =
      stored && isLocale(stored)
        ? stored
        : (locales as readonly string[]).includes(fromNav)
          ? (fromNav as (typeof locales)[number])
          : defaultLocale
    window.location.replace(localePath(target))
  }, [])

  return null
}
