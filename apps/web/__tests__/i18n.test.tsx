import { render, screen, act } from '@testing-library/react'
import { LangProvider, useLang } from '@/lib/i18n'

function TestConsumer() {
  const { lang, setLang } = useLang()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('pl')}>switch</button>
    </div>
  )
}

describe('useLang', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to en when no localStorage entry and navigator is not pl', () => {
    render(<LangProvider><TestConsumer /></LangProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('en')
  })

  it('reads saved language from localStorage', () => {
    localStorage.setItem('portfolio-lang', 'pl')
    render(<LangProvider><TestConsumer /></LangProvider>)
    // initial render is 'en', then useEffect fires
    act(() => {})
    expect(screen.getByTestId('lang').textContent).toBe('pl')
  })

  it('persists language change to localStorage', () => {
    render(<LangProvider><TestConsumer /></LangProvider>)
    act(() => { screen.getByText('switch').click() })
    expect(localStorage.getItem('portfolio-lang')).toBe('pl')
  })
})
