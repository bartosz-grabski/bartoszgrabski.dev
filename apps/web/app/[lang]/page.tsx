import { fetchServices } from '@/lib/queries'
import { ServicesView } from '@/components/services/ServicesView'

// Services is the index view; title/description/canonical come from the locale layout.
export default async function ServicesPage() {
  const services = await fetchServices()
  return <ServicesView services={services} />
}
