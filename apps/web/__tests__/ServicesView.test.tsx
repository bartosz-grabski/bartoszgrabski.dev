import { render, screen } from '@testing-library/react'
import { LangProvider } from '@/lib/i18n'
import { ServicesView } from '@/components/services/ServicesView'
import type { Services } from '@/lib/types'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/en',
}))

function renderWithLang(ui: React.ReactElement, lang: 'en' | 'pl' = 'en') {
  return render(<LangProvider lang={lang}>{ui}</LangProvider>)
}

const services: Services = {
  title: { en: 'services', pl: 'usługi' },
  lede: { en: 'Three things I do.', pl: 'Trzy rzeczy, które robię.' },
  blocks: [
    {
      cmd: 'web',
      tag: { en: 'Websites', pl: 'Strony' },
      blurb: { en: 'Fast sites.', pl: 'Szybkie strony.' },
      bullets: [{ text: { en: 'Landing pages', pl: 'Landing page' } }],
      stack: [{ en: 'Next.js', pl: 'Next.js' }],
      note: { en: '2–5 weeks.', pl: '2–5 tygodni.' },
    },
    {
      cmd: 'ai',
      tag: { en: 'AI automation', pl: 'Automatyzacja AI' },
      blurb: { en: 'AI that saves hours.', pl: 'AI, które oszczędza godziny.' },
      bullets: [{ text: { en: 'RAG assistants', pl: 'Asystenci RAG' } }],
      stack: [{ en: 'Vector search', pl: 'Wyszukiwanie wektorowe' }],
      note: { en: '2-week pilot.', pl: '2-tygodniowy pilotaż.' },
    },
  ],
  howHeading: { en: 'how it runs', pl: 'jak to przebiega' },
  steps: [
    { title: { en: 'Call', pl: 'Rozmowa' }, text: { en: '30 minutes.', pl: '30 minut.' } },
    { title: { en: 'Scope', pl: 'Zakres' }, text: { en: 'Fixed scope.', pl: 'Spisany zakres.' } },
    { title: { en: 'Handover', pl: 'Przekazanie' }, text: { en: 'Yours.', pl: 'Twoje.' } },
  ],
  cta: {
    line: { en: 'get in touch', pl: 'odezwij się' },
    blurb: { en: 'Send a couple of lines.', pl: 'Napisz kilka zdań.' },
    book: { en: 'book a call', pl: 'umów rozmowę' },
  },
}

const props = {
  services,
  email: 'hello@bartoszgrabski.dev',
  phone: '+48 604 998 453',
  calendarUrl: 'https://cal.com/bgrabski/intro',
}

describe('ServicesView', () => {
  it('renders a panel per service block', () => {
    renderWithLang(<ServicesView {...props} />)
    for (const cmd of ['web', 'ai']) {
      expect(screen.getByRole('heading', { level: 3, name: cmd })).toBeInTheDocument()
    }
    expect(screen.getByText('Landing pages')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
    expect(screen.getByText('2–5 weeks.')).toBeInTheDocument()
  })

  it('renders the process steps in order with numbering', () => {
    renderWithLang(<ServicesView {...props} />)
    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)
      .filter((t) => ['Call', 'Scope', 'Handover'].includes(t ?? ''))
    expect(titles).toEqual(['Call', 'Scope', 'Handover'])
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('links the CTA to calendar, email and phone', () => {
    renderWithLang(<ServicesView {...props} />)
    expect(screen.getByRole('link', { name: 'book a call' })).toHaveAttribute(
      'href',
      'https://cal.com/bgrabski/intro',
    )
    expect(screen.getByRole('link', { name: props.email })).toHaveAttribute(
      'href',
      `mailto:${props.email}`,
    )
    // tel: href strips spaces so it dials correctly
    expect(screen.getByRole('link', { name: props.phone })).toHaveAttribute(
      'href',
      'tel:+48604998453',
    )
  })

  it('omits the phone button when no phone is provided', () => {
    renderWithLang(<ServicesView services={services} email={props.email} />)
    expect(screen.queryByRole('link', { name: props.phone })).not.toBeInTheDocument()
  })

  it('renders Polish copy under the pl locale', () => {
    renderWithLang(<ServicesView {...props} />, 'pl')
    expect(screen.getByRole('heading', { level: 2, name: 'usługi' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'umów rozmowę' })).toBeInTheDocument()
    expect(screen.getByText('Wyszukiwanie wektorowe')).toBeInTheDocument()
  })

  it('renders nothing until the services document exists', () => {
    const { container } = renderWithLang(<ServicesView services={null} email={props.email} />)
    expect(container).toBeEmptyDOMElement()
  })
})
