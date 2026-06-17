import type { Metadata } from 'next'
import { siteUrl, localePath, defaultLocale } from '@/lib/site'

// Second root layout (the locale layout under /[lang] is the other). This one
// only backs the '/' redirect route, so it stays minimal — no fonts, no chrome.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // No content of its own; the canonical entry point is the default locale.
  alternates: { canonical: localePath(defaultLocale) },
  robots: { index: false, follow: true },
}

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={defaultLocale}>
      <head>
        {/* No-JS fallback: send crawlers and scriptless clients to the default locale. */}
        <meta httpEquiv="refresh" content={`0; url=${localePath(defaultLocale)}`} />
      </head>
      <body>{children}</body>
    </html>
  )
}
