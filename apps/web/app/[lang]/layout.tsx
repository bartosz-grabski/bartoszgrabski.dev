import { JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import '@/styles/terminal.css'
import { fetchResume, fetchSiteSettings } from '@/lib/queries'
import { buildJsonLd } from '@/lib/jsonLd'
import { AppChrome } from '@/components/layout/AppChrome'
import { ThemeScript } from '@/components/layout/ThemeScript'
import {
  locales,
  isLocale,
  siteUrl,
  localePath,
  localeUrl,
  defaultLocale,
  type Locale,
} from '@/lib/site'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const META: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: 'Bartosz Grabski — Fullstack Developer',
    description:
      'Bartosz Grabski — fullstack developer in Kraków, Poland. I build web apps end to end with TypeScript, React, Next.js and Node. Open to freelance and contract work.',
    ogLocale: 'en_US',
  },
  pl: {
    title: 'Bartosz Grabski — Programista Fullstack',
    description:
      'Bartosz Grabski — programista fullstack z Krakowa. Tworzę aplikacje webowe od początku do końca w TypeScript, React, Next.js i Node. Otwarty na współpracę freelance i kontraktową.',
    ogLocale: 'pl_PL',
  },
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : defaultLocale
  const m = META[locale]

  // Prefer SEO copy from Sanity; fall back to the hardcoded defaults above so
  // metadata never renders empty if the field is unset.
  const { seo } = await fetchSiteSettings()
  const title = seo?.title?.[locale] ?? m.title
  const description = seo?.description?.[locale] ?? m.description

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s · Bartosz Grabski`,
    },
    description,
    applicationName: 'Bartosz Grabski',
    authors: [{ name: 'Bartosz Grabski', url: siteUrl }],
    creator: 'Bartosz Grabski',
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    alternates: {
      canonical: localePath(locale),
      languages: {
        en: localeUrl('en'),
        pl: localeUrl('pl'),
        'x-default': localeUrl(defaultLocale),
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Bartosz Grabski',
      title,
      description,
      url: localeUrl(locale),
      locale: m.ogLocale,
      alternateLocale: locale === 'en' ? 'pl_PL' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0e0e' },
  ],
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const [resume, siteSettings] = await Promise.all([fetchResume(), fetchSiteSettings()])
  const jsonLd = buildJsonLd(resume, siteSettings, lang)

  return (
    <html lang={lang} data-theme="light" className={jetbrainsMono.variable} suppressHydrationWarning>
      <head>
        {/* Anti-flash theme: applies the saved theme before first paint.
            Emitted only on the initial document load (see ThemeScript) so it
            doesn't re-render on client-side locale switches. */}
        <ThemeScript />
        {/* schema.org Person/WebSite/ProfilePage. type="application/ld+json" is
            a non-executable data block, so React renders it without the
            <script> warning and it survives client-side locale switches. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </head>
      <body>
        <AppChrome lang={lang} resume={resume} siteSettings={siteSettings}>
          {children}
        </AppChrome>
      </body>
    </html>
  )
}
