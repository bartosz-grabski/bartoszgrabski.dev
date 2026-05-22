import { useLang } from '@/lib/i18n'
import { Avatar } from '@/components/ui/Avatar'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ExperienceList } from './ExperienceList'
import { SkillsBlock } from './SkillsBlock'
import { EducationList } from './EducationList'
import { SpeakingList } from './SpeakingList'
import { LanguageList } from './LanguageList'
import type { Resume } from '@/lib/types'

interface CVViewProps {
  resume: Resume
  onExportJSON: () => void
  onPrint: () => void
}

export function CVView({ resume, onExportJSON, onPrint }: CVViewProps) {
  const { T, t } = useLang()
  const { basics } = resume

  return (
    <div className="cv" data-view="cv">
      <aside className="meta-col">
        <div className="avatar-wrap no-print">
          <Avatar image={basics.image} name={basics.name} />
        </div>

        <section className="bio">
          <Eyebrow>{T.sections.about}</Eyebrow>
          {t(basics.summary).split('\n').filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <SkillsBlock skills={resume.skills} skillsNote={resume.skillsNote} />
        <EducationList education={resume.education} />
        {resume.speaking.length > 0 && <SpeakingList speaking={resume.speaking} />}
        <LanguageList languages={resume.languages} />
      </aside>

      <main className="main-col">
        <div className="cv-actions no-print" style={{ marginBottom: 28, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onExportJSON}>{T.buttons.json}</button>
          <button className="btn primary" onClick={onPrint}>{T.buttons.pdf}</button>
        </div>
        <ExperienceList work={resume.work} />
      </main>
    </div>
  )
}
