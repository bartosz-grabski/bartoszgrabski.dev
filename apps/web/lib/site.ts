// Single source of truth for locales, the canonical site URL, and route shape.
// Used by metadata, the sitemap, hreflang alternates, and the i18n provider.

export const locales = ['en', 'pl'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

/** Sections that exist under every locale. '' is the CV (index) view. */
export const sections = ['', 'now', 'contact'] as const
export type Section = (typeof sections)[number]

/** Canonical origin, no trailing slash. Override via NEXT_PUBLIC_SITE_URL. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bartoszgrabski.dev'
).replace(/\/$/, '')

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Build a root-relative path for a locale + section, e.g. ('pl', 'now') → '/pl/now'. */
export function localePath(locale: Locale, section: Section = ''): string {
  return section ? `/${locale}/${section}` : `/${locale}`
}

/** Absolute URL for a locale + section. */
export function localeUrl(locale: Locale, section: Section = ''): string {
  return `${siteUrl}${localePath(locale, section)}`
}

/**
 * Given the current pathname, return the section it points at.
 * '/en' → '', '/pl/now' → 'now'. Unknown → ''.
 */
export function sectionFromPath(pathname: string): Section {
  const parts = pathname.split('/').filter(Boolean) // ['en', 'now']
  const seg = parts[1] ?? ''
  return (sections as readonly string[]).includes(seg) ? (seg as Section) : ''
}

/** Swap the locale prefix of a pathname, preserving the section. */
export function swapLocale(pathname: string, next: Locale): string {
  return localePath(next, sectionFromPath(pathname))
}

/** Canonical + hreflang alternates for a given locale/section, for Metadata. */
export function sectionAlternates(locale: Locale, section: Section = '') {
  return {
    canonical: localePath(locale, section),
    languages: {
      en: localeUrl('en', section),
      pl: localeUrl('pl', section),
      'x-default': localeUrl(defaultLocale, section),
    },
  }
}
