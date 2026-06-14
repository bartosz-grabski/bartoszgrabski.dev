import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { RichText } from '@/components/ui/RichText'
import type { Skill, Bilingual } from '@/lib/types'

interface SkillsBlockProps {
  skills: Skill[]
  skillsNote?: Bilingual
}

export function SkillsBlock({ skills, skillsNote }: SkillsBlockProps) {
  const { T, t } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.skills}</Eyebrow>
      {skills.map((s, i) => (
        <div className="skill-block" key={i}>
          <p className="label">{s.name}</p>
          <p className="items">{s.keywords.join(' · ')}</p>
        </div>
      ))}
      {skillsNote && <p className="skill-note"><RichText text={t(skillsNote)} /></p>}
    </section>
  )
}
