import { fetchResume, fetchServices, fetchSiteSettings } from '@/lib/queries'
import { ServicesView } from '@/components/services/ServicesView'

// Services is the index view; title/description/canonical come from the locale layout.
export default async function ServicesPage() {
  const [resume, siteSettings, services] = await Promise.all([
    fetchResume(),
    fetchSiteSettings(),
    fetchServices(),
  ])
  return (
    <ServicesView
      services={services}
      email={resume.basics.email}
      phone={resume.basics.phone}
      calendarUrl={siteSettings.calendarUrl}
    />
  )
}
