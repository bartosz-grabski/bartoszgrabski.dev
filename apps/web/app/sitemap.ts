import type { MetadataRoute } from 'next'
import { locales, sections, localeUrl, defaultLocale } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  // One entry per locale × section, each carrying hreflang alternates so search
  // engines treat /en/<x> and /pl/<x> as translations of the same page.
  return locales.flatMap((locale) =>
    sections.map((section) => ({
      url: localeUrl(locale, section),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: section === '' ? 1 : 0.8,
      alternates: {
        languages: {
          en: localeUrl('en', section),
          pl: localeUrl('pl', section),
          'x-default': localeUrl(defaultLocale, section),
        },
      },
    })),
  )
}
