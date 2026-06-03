import { fetchResume, fetchNow, fetchSiteSettings } from '@/lib/queries'
import { fetchCurrentlyReading } from '@/lib/goodreads'
import { Portfolio } from '@/components/Portfolio'

export default async function Page() {
  const [resume, now, goodreads, siteSettings] = await Promise.all([
    fetchResume(),
    fetchNow(),
    fetchCurrentlyReading(),
    fetchSiteSettings(),
  ])

  const sanityDate = now._updatedAt
  const goodreadsDate = goodreads.updatedAt
  const asOf = (goodreadsDate && (!sanityDate || new Date(goodreadsDate) > new Date(sanityDate)))
    ? goodreadsDate
    : (sanityDate ?? new Date().toISOString())

  return <Portfolio resume={resume} now={now} books={goodreads.books} asOf={asOf} siteSettings={siteSettings} />
}
