import { useLang } from '@/lib/i18n'
import type { Work } from '@/lib/types'

export function ExperienceList({ work }: { work: Work[] }) {
  const { T, t } = useLang()
  return (
    <section>
      <h3 className="eyebrow">{T.sections.experience}</h3>
      {work.map((item, i) => (
        <article className="exp-item" key={i}>
          <header className="exp-head">
            <h4 className="role">
              <span className="co">{t(item.position)}</span>
              <span className="at">{T.atSep}</span>
              <em>{item.name}</em>
            </h4>
            <span className="dates">{item.startDate} — {item.endDate}</span>
          </header>
          <p className="exp-summary">{t(item.summary)}</p>
          {item.highlights.length > 0 && (
            <ul className="exp-bullets">
              {item.highlights.map((h, j) => (
                <li key={j}>{t(h.text)}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  )
}
