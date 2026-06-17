import type { MetadataRoute } from 'next'
import { localePath, defaultLocale } from '@/lib/site'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bartosz Grabski — Fullstack Developer',
    short_name: 'B. Grabski',
    description: 'Fullstack developer in Kraków, Poland.',
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
