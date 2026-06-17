import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import imageUrlBuilder from '@sanity/image-url'
import { locales } from '@/lib/site'
import { client } from '@/lib/sanity'
import { fetchResume } from '@/lib/queries'

const builder = imageUrlBuilder(client)

// Favicon used as a fallback portrait when the Sanity image is missing.
// Embedded as a data URI so it resolves during the static (`output: export`) build.
const faviconDataUri = `data:image/png;base64,${readFileSync(
  join(process.cwd(), 'public', 'apple-touch-icon.png'),
).toString('base64')}`

// Applies to every route under /[lang]. Rendered to a static PNG at build time.
export const dynamic = 'force-static'
export const alt = 'Bartosz Grabski — Fullstack Developer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Required for `output: export` since this image lives under the [lang] segment.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function OpengraphImage() {
  const { basics } = await fetchResume()

  // The portrait used on the CV view. Square crop aligned to the top of the
  // source image so the head stays in frame. Falls back to the favicon.
  const portrait = basics.image
    ? builder.image(basics.image).width(480).height(480).fit('crop').crop('top').auto('format').url()
    : faviconDataUri

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0e0e0e',
          color: '#f5f5f5',
          fontFamily: 'monospace',
        }}
      >
        {/*
         * Everything lives in a centered column inside a square safe-zone so
         * chat apps (WhatsApp, iMessage…) that center-crop the 1200×630 image
         * to a square thumbnail still show the name and title intact.
         */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: 560,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portrait}
            alt=""
            width={240}
            height={240}
            style={{
              width: 240,
              height: 240,
              borderRadius: 24,
              objectFit: 'cover',
              border: '2px solid #2a2a2a',
            }}
          />
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              marginTop: 40,
            }}
          >
            Bartosz Grabski
          </div>
          <div style={{ fontSize: 34, color: '#8ab4f8', marginTop: 18 }}>
            Fullstack Developer · Kraków
          </div>
          <div style={{ fontSize: 26, color: '#9a9a9a', marginTop: 28 }}>
            bartoszgrabski.dev
          </div>
        </div>
      </div>
    ),
    size,
  )
}
