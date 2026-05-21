import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Language } from '@/lib/types'

export function LanguageList({ languages }: { languages: Language[] }) {
  const { T } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.languages}</Eyebrow>
      {languages.map((l, i) => (
        <div className="lang-item" key={i}>
          <p className="name">{l.language}</p>
          <p className="level">{T.langLevels[l.fluency] ?? l.fluency}</p>
        </div>
      ))}
    </section>
  )
}
