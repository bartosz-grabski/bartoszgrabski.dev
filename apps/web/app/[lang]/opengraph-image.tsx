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

  // Full-height portrait, narrower than the canvas, centered on the dark
  // background. Crop aligned to the top of the source so the head stays in
  // frame. Falls back to the favicon when no Sanity image is set.
  const portraitWidth = 500
  const portrait = basics.image
    ? builder
        .image(basics.image)
        .width(portraitWidth * 2)
        .height(size.height * 2)
        .fit('crop')
        .crop('top')
        .auto('format')
        .url()
    : faviconDataUri

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0e0e0e',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portrait}
          alt=""
          width={portraitWidth}
          height={size.height}
          style={{
            width: portraitWidth,
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
          }}
        />
      </div>
    ),
    size,
  )
}
