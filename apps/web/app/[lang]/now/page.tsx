import type { Metadata } from 'next'
import { fetchNow } from '@/lib/queries'
import { fetchCurrentlyReading } from '@/lib/goodreads'
import { NowView } from '@/components/now/NowView'
import { isLocale, defaultLocale, sectionAlternates, type Locale } from '@/lib/site'

const META: Record<Locale, { title: string; description: string }> = {
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
  const m = META[locale]
  return {
    title: m.title,
    description: m.description,
    alternates: sectionAlternates(locale, 'now'),
    openGraph: { title: `${m.title} · Bartosz Grabski`, description: m.description },
  }
}

export default async function NowPage() {
  const [now, goodreads] = await Promise.all([fetchNow(), fetchCurrentlyReading()])

  const sanityDate = now._updatedAt
  const goodreadsDate = goodreads.updatedAt
  const asOf =
    goodreadsDate && (!sanityDate || new Date(goodreadsDate) > new Date(sanityDate))
      ? goodreadsDate
      : sanityDate ?? new Date().toISOString()

  return <NowView now={now} books={goodreads.books} asOf={asOf} />
}
