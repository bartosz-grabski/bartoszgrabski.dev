'use client'
import { useCallback } from 'react'
import { useLang } from '@/lib/i18n'
import { useToast } from '@/lib/toast'
import { Avatar } from '@/components/ui/Avatar'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { RichText } from '@/components/ui/RichText'
import { ExperienceList } from './ExperienceList'
import { SkillsBlock } from './SkillsBlock'
import { EducationList } from './EducationList'
import { SpeakingList } from './SpeakingList'
import { LanguageList } from './LanguageList'
import type { Resume } from '@/lib/types'

interface CVViewProps {
  resume: Resume
}

export function CVView({ resume }: CVViewProps) {
  const { T, t } = useLang()
  const showToast = useToast()
  const { basics } = resume

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bartosz-grabski-cv.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast(T.toasts.json)
  }, [resume, T, showToast])

  return (
    <div className="cv" data-view="cv">
      <div className="cv-actions no-print">
        <button className="btn" onClick={exportJSON}>{T.buttons.json}</button>
        <button className="btn primary" onClick={() => window.print()}>{T.buttons.pdf}</button>
      </div>

      <aside className="meta-col">
        <div className="avatar-wrap no-print">
          <Avatar image={basics.image} name={basics.name} />
        </div>

        <section className="bio">
          <Eyebrow>{T.sections.about}</Eyebrow>
          {t(basics.summary).split('\n').filter(Boolean).map((p, i) => (
            <p key={i}><RichText text={p} /></p>
          ))}
        </section>

        <SkillsBlock skills={resume.skills} skillsNote={resume.skillsNote} />
        <EducationList education={resume.education} />
        {(resume.speaking?.length ?? 0) > 0 && <SpeakingList speaking={resume.speaking} />}
        <LanguageList languages={resume.languages} />
      </aside>

      <main className="main-col">
        <ExperienceList work={resume.work} />
      </main>
    </div>
  )
}
