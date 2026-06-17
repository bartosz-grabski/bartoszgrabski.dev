import type { Metadata } from 'next'
import { fetchResume, fetchSiteSettings } from '@/lib/queries'
import { ContactView } from '@/components/contact/ContactView'
import { isLocale, defaultLocale, sectionAlternates, type Locale } from '@/lib/site'

const META: Record<Locale, { title: string; description: string }> = {
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
  const m = META[locale]
  return {
    title: m.title,
    description: m.description,
    alternates: sectionAlternates(locale, 'contact'),
    openGraph: { title: `${m.title} · Bartosz Grabski`, description: m.description },
  }
}

export default async function ContactPage() {
  const [resume, siteSettings] = await Promise.all([fetchResume(), fetchSiteSettings()])
  return (
    <ContactView
      resume={resume}
      availabilityLabel={siteSettings.availabilityLabel}
      calendarUrl={siteSettings.calendarUrl}
      channels={siteSettings.channels}
      contact={siteSettings.contact}
    />
  )
}
