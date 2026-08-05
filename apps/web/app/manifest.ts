import type { MetadataRoute } from 'next'
import { fetchResume } from '@/lib/queries'
import { localePath, defaultLocale } from '@/lib/site'

export const dynamic = 'force-static'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { basics } = await fetchResume()
  const country = basics.location.countryCode
    ? new Intl.DisplayNames(['en'], { type: 'region' }).of(basics.location.countryCode)
    : undefined
  const location = [basics.location.city, country].filter(Boolean).join(', ')

  return {
    name: `${basics.name} — ${basics.label.en}`,
    short_name: 'B. Grabski',
    description: `${basics.label.en} in ${location}.`,
    start_url: localePath(defaultLocale),
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
