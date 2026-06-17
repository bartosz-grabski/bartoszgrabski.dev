import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './sanity'
import { siteUrl, localeUrl, type Locale } from './site'
import type { Resume, SiteSettings } from './types'

const builder = createImageUrlBuilder(client)

const JOB_TITLE: Record<Locale, string> = {
  en: 'Fullstack Developer',
  pl: 'Programista Fullstack',
}

/** Trailing slashes vary in CMS-entered URLs; normalize so sameAs dedupes cleanly. */
const normalizeUrl = (u: string) => u.trim().replace(/\/$/, '')

/**
 * Builds a schema.org `@graph` (Person + WebSite + ProfilePage) from CMS
 * content for the given locale. Emitted as application/ld+json in the layout so
 * search engines and LLM crawlers get explicit, machine-readable identity,
 * skills, and employment data instead of inferring them from prose.
 */
export function buildJsonLd(
  resume: Resume,
  siteSettings: SiteSettings,
  locale: Locale,
): string {
  const { basics } = resume
  const personId = `${siteUrl}/#person`
  const siteId = `${siteUrl}/#website`
  const pageUrl = localeUrl(locale)

  // Profiles (resume) + channels (site settings) → sameAs, deduped by
  // normalized URL (CMS entries vary by trailing slash).
  const sameAs = Array.from(
    new Set(
      [
        ...(basics.profiles ?? []).map((p) => p.url),
        ...(siteSettings.channels ?? []).map((c) => c.url),
      ]
        .filter(Boolean)
        .map(normalizeUrl),
    ),
  )

  // Flatten skill keywords into knowsAbout. The skill `name` is a category
  // label ("Languages", "Frontend"), not a topic, so only keywords are used.
  const knowsAbout = Array.from(
    new Set(
      resume.skills
        .flatMap((s) => s.keywords ?? [])
        .map((k) => k.trim())
        .filter(Boolean),
    ),
  )

  const imageUrl = basics.image
    ? builder.image(basics.image).width(800).height(1000).auto('format').url()
    : undefined

  // Current employer = first position of the most recent work entry.
  const currentEmployer = resume.work[0]?.name

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: basics.name,
    jobTitle: JOB_TITLE[locale],
    description: basics.summary[locale] ?? basics.summary.en,
    url: pageUrl,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(basics.email ? { email: `mailto:${basics.email}` } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: basics.location.city,
      addressCountry: basics.location.countryCode,
    },
    ...(currentEmployer
      ? { worksFor: { '@type': 'Organization', name: currentEmployer } }
      : {}),
    ...(knowsAbout.length ? { knowsAbout } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }

  const website = {
    '@type': 'WebSite',
    '@id': siteId,
    url: siteUrl,
    name: basics.name,
    inLanguage: ['en', 'pl'],
    author: { '@id': personId },
    publisher: { '@id': personId },
  }

  const profilePage = {
    '@type': 'ProfilePage',
    url: pageUrl,
    inLanguage: locale,
    isPartOf: { '@id': siteId },
    about: { '@id': personId },
    mainEntity: { '@id': personId },
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [person, website, profilePage],
  })
}
