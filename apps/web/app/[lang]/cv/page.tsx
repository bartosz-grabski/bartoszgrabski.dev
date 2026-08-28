import type { Metadata } from 'next'
import { fetchResume } from '@/lib/queries'
import { CVView } from '@/components/cv/CVView'
import { isLocale, defaultLocale, sectionAlternates, type Locale } from '@/lib/site'

const META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'CV',
    description:
      'CV of Bartosz Grabski — fullstack developer in Kraków, Poland. Experience, skills, education and talks. Available as PDF or JSON.',
  },
  pl: {
    title: 'CV',
    description:
      'CV Bartosza Grabskiego — programisty fullstack z Krakowa. Doświadczenie, umiejętności, wykształcenie i wystąpienia. Do pobrania jako PDF lub JSON.',
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
    alternates: sectionAlternates(locale, 'cv'),
    openGraph: { title: `${m.title} · Bartosz Grabski`, description: m.description },
  }
}

export default async function CVPage() {
  const resume = await fetchResume()
  return <CVView resume={resume} />
}
