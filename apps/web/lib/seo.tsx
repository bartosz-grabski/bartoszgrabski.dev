import type { Metadata } from 'next'
import { localeUrl, sectionAlternates, type Locale, type Section } from './site'

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', pl: 'pl_PL' }

export interface SectionMeta {
  title: string
  description: string
}

/**
 * Complete metadata for a locale sub-page (/cv, /now, /contact).
 *
 * Next.js REPLACES (not merges) the parent's `openGraph`/`twitter` objects
 * when a page defines its own, so every field — url, type, locale, image —
 * must be restated here. Without this, sub-pages lost og:url/og:type/og:image
 * (the [lang] segment's file-convention image stops applying once a page sets
 * `openGraph`) and inherited the homepage's twitter:title.
 */
export function sectionMetadata(
  locale: Locale,
  section: Exclude<Section, ''>,
  m: SectionMeta,
): Metadata {
  const fullTitle = `${m.title} · Bartosz Grabski`
  return {
    title: m.title,
    description: m.description,
    alternates: sectionAlternates(locale, section),
    openGraph: {
      type: 'website',
      siteName: 'Bartosz Grabski',
      title: fullTitle,
      description: m.description,
      url: localeUrl(locale, section),
      locale: OG_LOCALE[locale],
      alternateLocale: locale === 'en' ? 'pl_PL' : 'en_US',
      images: [`${localeUrl(locale)}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: m.description,
    },
  }
}

/**
 * schema.org BreadcrumbList for a sub-page (Home → Section). Signals the
 * site's page hierarchy to search engines so results can show the page as a
 * sub-page of the site rather than a stray URL.
 */
export function BreadcrumbJsonLd({
  locale,
  section,
  name,
}: {
  locale: Locale
  section: Exclude<Section, ''>
  name: string
}) {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bartosz Grabski', item: localeUrl(locale) },
      { '@type': 'ListItem', position: 2, name, item: localeUrl(locale, section) },
    ],
  })
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
}
