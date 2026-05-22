import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Education } from '@/lib/types'

export function EducationList({ education }: { education: Education[] }) {
  const { T, t } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.education}</Eyebrow>
      {education.map((e, i) => (
        <div className="edu-item" key={i}>
          <p className="school">{e.institution}</p>
          <p className="degree">{e.studyType} — {t(e.area)}</p>
          <p className="dates">{e.startDate} — {e.endDate}</p>
        </div>
      ))}
    </section>
  )
}
