import type { Metadata } from 'next'
import { fetchResume, fetchSiteSettings } from '@/lib/queries'
import { ContactView } from '@/components/contact/ContactView'
import { isLocale, defaultLocale, type Locale } from '@/lib/site'
import { sectionMetadata, BreadcrumbJsonLd, type SectionMeta } from '@/lib/seo'

const META: Record<Locale, SectionMeta> = {
  en: {
    title: 'Contact',
    description: 'Get in touch with Bartosz Grabski — email or book a 30-minute intro call. Open to freelance, contract and full-time work.',
  },
  pl: {
    title: 'Kontakt',
    description: 'Skontaktuj się z Bartoszem Grabskim — mailem lub zarezerwuj 30-minutową rozmowę. Otwarty na freelance, kontrakt i pełen etat.',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : defaultLocale
  return sectionMetadata(locale, 'contact', META[locale])
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : defaultLocale
  const [resume, siteSettings] = await Promise.all([fetchResume(), fetchSiteSettings()])
  return (
    <>
      <BreadcrumbJsonLd locale={locale} section="contact" name={META[locale].title} />
      <ContactView
        resume={resume}
        availabilityLabel={siteSettings.availabilityLabel}
        calendarUrl={siteSettings.calendarUrl}
        channels={siteSettings.channels}
        contact={siteSettings.contact}
      />
    </>
  )
}
