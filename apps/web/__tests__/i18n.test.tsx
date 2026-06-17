import { render, screen, act } from '@testing-library/react'
import { LangProvider, useLang } from '@/lib/i18n'

const push = jest.fn()
let pathname = '/en/now'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}))

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
  beforeEach(() => {
    push.mockClear()
    pathname = '/en/now'
  })

  it('reflects the locale passed by the route', () => {
    render(<LangProvider lang="en"><TestConsumer /></LangProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('en')
  })

  it('exposes the active locale (pl)', () => {
    render(<LangProvider lang="pl"><TestConsumer /></LangProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('pl')
  })

  it('navigates to the equivalent path in the other locale, preserving the section', () => {
    render(<LangProvider lang="en"><TestConsumer /></LangProvider>)
    act(() => { screen.getByText('switch').click() })
    expect(push).toHaveBeenCalledWith('/pl/now')
  })
})
