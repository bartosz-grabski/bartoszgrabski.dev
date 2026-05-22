import { fetchResume, fetchNow } from '@/lib/queries'
import { fetchCurrentlyReading } from '@/lib/goodreads'
import { Portfolio } from '@/components/Portfolio'

export default async function Page() {
  const [resume, now, initialBooks] = await Promise.all([
    fetchResume(),
    fetchNow(),
    fetchCurrentlyReading(),
  ])

  return <Portfolio resume={resume} now={now} initialBooks={initialBooks} />
}
