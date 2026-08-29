import type { Metadata } from 'next'
import { fetchNow } from '@/lib/queries'
import { fetchCurrentlyReading } from '@/lib/goodreads'
import { NowView } from '@/components/now/NowView'
import { isLocale, defaultLocale, type Locale } from '@/lib/site'
import { sectionMetadata, BreadcrumbJsonLd, type SectionMeta } from '@/lib/seo'

const META: Record<Locale, SectionMeta> = {
  en: {
    title: 'Now',
    description: "What Bartosz Grabski is working on, learning and reading right now — a Derek Sivers–style now page.",
  },
  pl: {
    title: 'Teraz',
    description: 'Nad czym Bartosz Grabski teraz pracuje, czego się uczy i co czyta — strona „teraz” w stylu Dereka Siversa.',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : defaultLocale
  return sectionMetadata(locale, 'now', META[locale])
}

export default async function NowPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : defaultLocale
  const [now, goodreads] = await Promise.all([fetchNow(), fetchCurrentlyReading()])

  const sanityDate = now._updatedAt
  const goodreadsDate = goodreads.updatedAt
  const asOf =
    goodreadsDate && (!sanityDate || new Date(goodreadsDate) > new Date(sanityDate))
      ? goodreadsDate
      : sanityDate ?? new Date().toISOString()

  return (
    <>
      <BreadcrumbJsonLd locale={locale} section="now" name={META[locale].title} />
      <NowView now={now} books={goodreads.books} asOf={asOf} />
    </>
  )
}
