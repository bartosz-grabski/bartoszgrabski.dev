import { Eyebrow } from '@/components/ui/Eyebrow'
import { useLang } from '@/lib/i18n'
import type { Work } from '@/lib/types'

export function ExperienceList({ work }: { work: Work[] }) {
  const { T, t } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.experience}</Eyebrow>
      {work.map((company, i) => {
        const isMulti = company.positions.length > 1
        const first = company.positions[0]
        const last = company.positions[company.positions.length - 1]
        return (
          <article className="exp-item" key={i}>
            {isMulti ? (
              <>
                <header className="exp-head">
                  <h4 className="role"><em>{company.name}</em></h4>
                  <span className="dates">{first.startDate} — {last.endDate}</span>
                </header>
                {company.location && <p className="exp-loc">{company.location}</p>}
                <div className="exp-subs">
                  {company.positions.map((pos, j) => (
                    <div className="exp-sub" key={j}>
                      <div className="exp-sub-head">
                        <span className="co">{t(pos.position)}</span>
                        <span className="dates">{pos.startDate} — {pos.endDate}</span>
                      </div>
                      {pos.summary && <p className="exp-summary">{t(pos.summary)}</p>}
                      {pos.highlights.length > 0 && (
                        <ul className="exp-bullets">
                          {pos.highlights.map((h, k) => (
                            <li key={k}>{t(h.text)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <header className="exp-head">
                  <h4 className="role">
                    <span className="co">{t(first.position)}</span>
                    <span className="at">{T.atSep}</span>
                    <em>{company.name}</em>
                  </h4>
                  <span className="dates">{first.startDate} — {first.endDate}</span>
                </header>
                {company.location && <p className="exp-loc">{company.location}</p>}
                {first.summary && <p className="exp-summary">{t(first.summary)}</p>}
                {first.highlights.length > 0 && (
                  <ul className="exp-bullets">
                    {first.highlights.map((h, j) => (
                      <li key={j}>{t(h.text)}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </article>
        )
      })}
    </section>
  )
}
