import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Speaking } from '@/lib/types'

export function SpeakingList({ speaking }: { speaking: Speaking[] }) {
  const { T, t } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.speaking}</Eyebrow>
      {speaking.map((s, i) => (
        <div className="talk-item" key={i}>
          <p className="title">{t(s.title)}</p>
          <p className="venue">{s.venue}</p>
          <p className="year">{s.year}</p>
        </div>
      ))}
    </section>
  )
}
