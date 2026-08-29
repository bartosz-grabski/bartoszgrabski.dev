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
    },
    {
      cmd: 'ai',
      tag: { en: 'AI automation', pl: 'Automatyzacja AI' },
      blurb: { en: 'AI that saves hours.', pl: 'AI, które oszczędza godziny.' },
      bullets: [{ text: { en: 'RAG assistants', pl: 'Asystenci RAG' } }],
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
    links: [
      { label: { en: 'book a call', pl: 'umów rozmowę' }, url: 'https://cal.com/bartosz-grabski', style: 'light' },
      { label: { en: 'contact', pl: 'kontakt' }, url: '/contact', style: 'default' },
      { label: { en: 'hello@bartoszgrabski.dev', pl: 'hello@bartoszgrabski.dev' }, url: 'mailto:hello@bartoszgrabski.dev' },
    ],
  },
}

describe('ServicesView', () => {
  it('renders a panel per service block with description and bullets only', () => {
    renderWithLang(<ServicesView services={services} />)
    for (const cmd of ['web', 'ai']) {
      expect(screen.getByRole('heading', { level: 3, name: cmd })).toBeInTheDocument()
    }
    expect(screen.getByText('Fast sites.')).toBeInTheDocument()
    expect(screen.getByText('Landing pages')).toBeInTheDocument()
  })

  it('renders the process steps in order with numbering', () => {
    renderWithLang(<ServicesView services={services} />)
    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)
      .filter((t) => ['Call', 'Scope', 'Handover'].includes(t ?? ''))
    expect(titles).toEqual(['Call', 'Scope', 'Handover'])
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('renders CTA buttons from the Sanity links list', () => {
    renderWithLang(<ServicesView services={services} />)
    const book = screen.getByRole('link', { name: 'book a call' })
    expect(book).toHaveAttribute('href', 'https://cal.com/bartosz-grabski')
    expect(book).toHaveAttribute('target', '_blank')
    expect(book).toHaveClass('btn', 'primary') // "light" style → filled accent

    const email = screen.getByRole('link', { name: 'hello@bartoszgrabski.dev' })
    expect(email).toHaveAttribute('href', 'mailto:hello@bartoszgrabski.dev')
    expect(email).toHaveClass('btn')
    expect(email).not.toHaveClass('primary')
    expect(email).not.toHaveAttribute('target')
  })

  it('locale-prefixes internal links', () => {
    renderWithLang(<ServicesView services={services} />)
    expect(screen.getByRole('link', { name: 'contact' })).toHaveAttribute('href', '/en/contact')
  })

  it('renders Polish copy under the pl locale', () => {
    renderWithLang(<ServicesView services={services} />, 'pl')
    expect(screen.getByRole('heading', { level: 2, name: 'usługi' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'umów rozmowę' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'kontakt' })).toHaveAttribute('href', '/pl/contact')
  })

  it('renders nothing until the services document exists', () => {
    const { container } = renderWithLang(<ServicesView services={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
