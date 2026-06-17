import { ImageResponse } from 'next/og'
import { locales } from '@/lib/site'

// Applies to every route under /[lang]. Rendered to a static PNG at build time.
export const dynamic = 'force-static'
export const alt = 'Bartosz Grabski — Fullstack Developer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Required for `output: export` since this image lives under the [lang] segment.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#0e0e0e',
          color: '#f5f5f5',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ fontSize: 30, color: '#9a9a9a' }}>bartoszgrabski.dev</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05 }}>
            Bartosz Grabski
          </div>
          <div style={{ fontSize: 44, color: '#8ab4f8', marginTop: 16 }}>
            Fullstack Developer · Kraków, Poland
          </div>
        </div>
      </div>
    ),
    size,
  )
}
