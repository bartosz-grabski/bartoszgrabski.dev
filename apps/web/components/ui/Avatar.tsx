import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/lib/sanity'
import type { SanityImageAsset } from '@/lib/types'

const builder = imageUrlBuilder(client)

interface AvatarProps {
  image: SanityImageAsset | null | undefined
  name: string
}

export function Avatar({ image, name }: AvatarProps) {
  if (!image) {
    return <div className="avatar-slot" aria-label={name} />
  }
  const src = builder.image(image).width(440).height(550).url()
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="avatar-slot"
      width={220}
      height={275}
    />
  )
}
