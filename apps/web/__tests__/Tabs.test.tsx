import { render, screen } from '@testing-library/react'
import { LangProvider } from '@/lib/i18n'
import { Tabs } from '@/components/layout/Tabs'
import { uiStringsFixture } from '../test-utils/uiStrings'
import type { UiStrings } from '@/lib/types'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/en',
}))

function renderTabs(strings: UiStrings) {
  return render(
    <LangProvider lang="en" strings={strings}>
      <Tabs />
    </LangProvider>,
  )
}

describe('Tabs', () => {
  it('renders tabs in the order of the Sanity nav array', () => {
    renderTabs(uiStringsFixture)
    const labels = screen.getAllByRole('link').map((a) => a.textContent)
    expect(labels).toEqual(['services', 'cv', 'now', 'contact'])
  })

  it('follows a reordered nav array and keeps the right hrefs', () => {
    renderTabs({ ...uiStringsFixture, nav: [...uiStringsFixture.nav].reverse() })
    const links = screen.getAllByRole('link')
    expect(links.map((a) => a.textContent)).toEqual(['contact', 'now', 'cv', 'services'])
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/en/contact',
      '/en/now',
      '/en/cv',
      '/en',
    ])
  })

  it('marks the active tab from the pathname', () => {
    renderTabs(uiStringsFixture)
    expect(screen.getByRole('link', { name: 'services' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'cv' })).not.toHaveAttribute('aria-current')
  })
})
