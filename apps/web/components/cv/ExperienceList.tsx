import { Eyebrow } from '@/components/ui/Eyebrow'
import { RichText } from '@/components/ui/RichText'
import { useLang } from '@/lib/i18n'
import type { Work, WorkPosition } from '@/lib/types'

// Positions arrive newest-first, so we can't rely on array order to derive the
// company-level span. Take the earliest start and latest end across all roles.
// An ongoing role (non YYYY-MM endDate, e.g. "Present") always wins as latest.
function aggregateRange(positions: WorkPosition[]) {
  const isOngoing = (end: string) => !/^\d{4}-\d{2}$/.test(end)
  const startDate = positions.reduce((min, p) => (p.startDate < min ? p.startDate : min), positions[0].startDate)
  const ongoing = positions.find((p) => isOngoing(p.endDate))
  const endDate = ongoing
    ? ongoing.endDate
    : positions.reduce((max, p) => (p.endDate > max ? p.endDate : max), positions[0].endDate)
  return { startDate, endDate }
}

export function ExperienceList({ work }: { work: Work[] }) {
  const { T, t } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.experience}</Eyebrow>
      {work.map((company, i) => {
        const positions = company.positions ?? []
        const isMulti = positions.length > 1
        const first = positions[0]
        const range = aggregateRange(positions)
        return (
          <article className={`exp-item${isMulti ? ' exp-item--multi' : ''}`} key={i}>
            {isMulti ? (
              <>
                <header className="exp-head">
                  <h4 className="role"><em>{company.name}</em></h4>
                  <span className="dates">{range.startDate} — {range.endDate}</span>
                </header>
                {company.location && <p className="exp-loc">{company.location}</p>}
                <div className="exp-subs">
                  {positions.map((pos, j) => (
                    <div className="exp-sub" key={j}>
                      <div className="exp-sub-head">
                        <span className="co">{t(pos.position)}</span>
                        <span className="dates">{pos.startDate} — {pos.endDate}</span>
                      </div>
                      {pos.summary && <p className="exp-summary"><RichText text={t(pos.summary)} /></p>}
                      {(pos.highlights?.length ?? 0) > 0 && (
                        <ul className="exp-bullets">
                          {pos.highlights.map((h, k) => (
                            <li key={k}><RichText text={t(h.text)} /></li>
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
                {first.summary && <p className="exp-summary"><RichText text={t(first.summary)} /></p>}
                {(first.highlights?.length ?? 0) > 0 && (
                  <ul className="exp-bullets">
                    {first.highlights.map((h, j) => (
                      <li key={j}><RichText text={t(h.text)} /></li>
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
