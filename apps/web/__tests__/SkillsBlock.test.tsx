import { render, screen } from '@testing-library/react'
import { LangProvider } from '@/lib/i18n'
import { SkillsBlock } from '@/components/cv/SkillsBlock'
import type { Skill, Bilingual } from '@/lib/types'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/en',
}))

function renderWithLang(ui: React.ReactElement) {
  return render(<LangProvider lang="en">{ui}</LangProvider>)
}

const skills: Skill[] = [
  { name: 'Frontend', keywords: ['React', 'Next.js'] },
  { name: 'AI Tools', keywords: ['Cursor', 'Claude Code'] },
]

const note: Bilingual = {
  en: 'Tech stacks come and go.',
  pl: 'Technologie przychodzą i odchodzą.',
}

describe('SkillsBlock', () => {
  it('renders skill category names', () => {
    renderWithLang(<SkillsBlock skills={skills} />)
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('AI Tools')).toBeInTheDocument()
  })

  it('renders keywords joined by ·', () => {
    renderWithLang(<SkillsBlock skills={skills} />)
    expect(screen.getByText('React · Next.js')).toBeInTheDocument()
  })

  it('renders skillsNote when provided', () => {
    renderWithLang(<SkillsBlock skills={skills} skillsNote={note} />)
    expect(screen.getByText('Tech stacks come and go.')).toBeInTheDocument()
  })

  it('does not render note element when skillsNote is absent', () => {
    const { container } = renderWithLang(<SkillsBlock skills={skills} />)
    expect(container.querySelector('.skill-note')).toBeNull()
  })

  it('renders markdown in skillsNote', () => {
    const rich: Bilingual = { en: 'Tools **change**.', pl: 'x' }
    const { container } = renderWithLang(<SkillsBlock skills={skills} skillsNote={rich} />)
    expect(container.querySelector('.skill-note strong')?.textContent).toBe('change')
  })
})
