import { render, screen } from '@testing-library/react'
import { LangProvider } from '@/lib/i18n'
import { ExperienceList } from '@/components/cv/ExperienceList'
import type { Work } from '@/lib/types'

function renderWithLang(ui: React.ReactElement) {
  return render(<LangProvider>{ui}</LangProvider>)
}

const singleRoleWork: Work[] = [{
  name: 'Voyantis',
  location: 'Tel Aviv, Israel (Remote)',
  positions: [{
    position: { en: 'Full Stack Engineer', pl: 'Fullstack Developer' },
    startDate: '2022-01',
    endDate: '2026-03',
    summary: { en: 'Built internal tools at an AI startup.', pl: 'Budowałem narzędzia.' },
    highlights: [
      { text: { en: 'Foresight UI dashboard', pl: 'Dashboard Foresight UI' } },
    ],
  }],
}]

const multiRoleWork: Work[] = [{
  name: 'HSBC Service Delivery',
  location: 'Kraków, Poland',
  positions: [
    {
      position: { en: 'Acting Tech Lead', pl: 'Acting Tech Lead' },
      startDate: '2018-08',
      endDate: '2018-12',
      summary: { en: 'Led Originations SSP.', pl: 'Prowadziłem Originations SSP.' },
      highlights: [],
    },
    {
      position: { en: 'Senior Fullstack Engineer', pl: 'Senior Fullstack Engineer' },
      startDate: '2018-02',
      endDate: '2018-08',
      summary: { en: 'Loans NTB journey.', pl: 'Ścieżka kredytowa NTB.' },
      highlights: [],
    },
  ],
}]

// GROQ returns `null` (not `[]`) for array fields that are absent on a document,
// e.g. a position with no highlights. The component must not crash on that.
const nullHighlightsSingle = [{
  name: 'FQ Enterprises AS',
  location: 'Oslo, Norway',
  positions: [{
    position: { en: 'Consultant', pl: 'Konsultant' },
    startDate: '2019-01',
    endDate: '2019-12',
    summary: { en: 'Contract work.', pl: 'Praca kontraktowa.' },
    highlights: null,
  }],
}] as unknown as Work[]

const nullHighlightsMulti = [{
  name: 'HSBC Service Delivery',
  location: 'Kraków, Poland',
  positions: [
    {
      position: { en: 'Acting Tech Lead', pl: 'Acting Tech Lead' },
      startDate: '2018-08',
      endDate: '2018-12',
      summary: { en: 'Led Originations SSP.', pl: 'Prowadziłem Originations SSP.' },
      highlights: null,
    },
    {
      position: { en: 'Senior Fullstack Engineer', pl: 'Senior Fullstack Engineer' },
      startDate: '2018-02',
      endDate: '2018-08',
      summary: { en: 'Loans NTB journey.', pl: 'Ścieżka kredytowa NTB.' },
      highlights: null,
    },
  ],
}] as unknown as Work[]

describe('ExperienceList', () => {
  it('renders a single-role entry whose highlights field is null (absent in CMS)', () => {
    renderWithLang(<ExperienceList work={nullHighlightsSingle} />)
    expect(screen.getByText('Consultant')).toBeInTheDocument()
    expect(screen.getByText('FQ Enterprises AS')).toBeInTheDocument()
  })

  it('renders a multi-role entry whose highlights fields are null (absent in CMS)', () => {
    renderWithLang(<ExperienceList work={nullHighlightsMulti} />)
    expect(screen.getByText('Acting Tech Lead')).toBeInTheDocument()
    expect(screen.getByText('Senior Fullstack Engineer')).toBeInTheDocument()
  })

  it('renders position and company for single-role entry', () => {
    renderWithLang(<ExperienceList work={singleRoleWork} />)
    expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument()
    expect(screen.getByText('Voyantis')).toBeInTheDocument()
  })

  it('renders location for single-role entry', () => {
    renderWithLang(<ExperienceList work={singleRoleWork} />)
    expect(screen.getByText('Tel Aviv, Israel (Remote)')).toBeInTheDocument()
  })

  it('renders highlights for single-role entry', () => {
    renderWithLang(<ExperienceList work={singleRoleWork} />)
    expect(screen.getByText('Foresight UI dashboard')).toBeInTheDocument()
  })

  it('renders company name as primary header for multi-role entry', () => {
    renderWithLang(<ExperienceList work={multiRoleWork} />)
    expect(screen.getByText('HSBC Service Delivery')).toBeInTheDocument()
  })

  it('renders all position titles for multi-role entry', () => {
    renderWithLang(<ExperienceList work={multiRoleWork} />)
    expect(screen.getByText('Acting Tech Lead')).toBeInTheDocument()
    expect(screen.getByText('Senior Fullstack Engineer')).toBeInTheDocument()
  })

  it('renders location for multi-role entry', () => {
    renderWithLang(<ExperienceList work={multiRoleWork} />)
    expect(screen.getByText('Kraków, Poland')).toBeInTheDocument()
  })
})
