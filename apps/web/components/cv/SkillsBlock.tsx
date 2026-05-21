import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Skill } from '@/lib/types'

export function SkillsBlock({ skills }: { skills: Skill[] }) {
  const { T } = useLang()
  return (
    <section>
      <Eyebrow>{T.sections.skills}</Eyebrow>
      {skills.map((s, i) => (
        <div className="skill-block" key={i}>
          <p className="label">{s.name}</p>
          <p className="items">{s.keywords.join(' · ')}</p>
        </div>
      ))}
    </section>
  )
}
