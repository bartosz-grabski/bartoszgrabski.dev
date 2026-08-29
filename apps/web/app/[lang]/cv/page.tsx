import type { Metadata } from 'next'
import { fetchResume } from '@/lib/queries'
import { CVView } from '@/components/cv/CVView'
import { isLocale, defaultLocale, type Locale } from '@/lib/site'
import { sectionMetadata, BreadcrumbJsonLd, type SectionMeta } from '@/lib/seo'

const META: Record<Locale, SectionMeta> = {
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
  return sectionMetadata(locale, 'cv', META[locale])
}

export default async function CVPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : defaultLocale
  const resume = await fetchResume()
  return (
    <>
      <BreadcrumbJsonLd locale={locale} section="cv" name={META[locale].title} />
      <CVView resume={resume} />
    </>
  )
}
