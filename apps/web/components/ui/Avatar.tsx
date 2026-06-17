import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from '@/lib/sanity'
import type { SanityImageAsset } from '@/lib/types'

const builder = createImageUrlBuilder(client)

interface AvatarProps {
  image: SanityImageAsset | null | undefined
  name: string
}

export function Avatar({ image, name }: AvatarProps) {
  if (!image) {
    // Decorative placeholder — hidden from assistive tech (no real content).
    return <div className="avatar-slot" role="presentation" />
  }
  const src = builder.image(image).width(440).height(550).auto('format').url()
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} — Fullstack Developer`}
      className="avatar-slot"
      width={220}
      height={275}
      loading="lazy"
      decoding="async"
    />
  )
}
