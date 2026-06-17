import { fetchResume } from '@/lib/queries'
import { CVView } from '@/components/cv/CVView'

// CV is the index view; title/description/canonical come from the locale layout.
export default async function CVPage() {
  const resume = await fetchResume()
  return <CVView resume={resume} />
}
