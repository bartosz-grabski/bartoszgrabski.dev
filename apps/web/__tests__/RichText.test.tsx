import { render } from '@testing-library/react'
import { parseInline, RichText } from '@/components/ui/RichText'

function html(text: string): string {
  const { container } = render(<RichText text={text} />)
  return container.innerHTML
}

describe('parseInline', () => {
  it('returns plain text unchanged', () => {
    expect(html('just words')).toBe('just words')
  })

  it('renders **bold** as <strong>', () => {
    expect(html('a **b** c')).toBe('a <strong>b</strong> c')
  })

  it('renders *italic* as <em>', () => {
    expect(html('a *b* c')).toBe('a <em>b</em> c')
  })

  it('renders `code` as <code>', () => {
    expect(html('a `b` c')).toBe('a <code>b</code> c')
  })

  it('renders an external link with target+rel', () => {
    expect(html('see [site](https://x.com)')).toBe(
      'see <a href="https://x.com" target="_blank" rel="noopener noreferrer">site</a>',
    )
  })

  it('renders a mailto link without target', () => {
    expect(html('[mail](mailto:a@b.com)')).toBe(
      '<a href="mailto:a@b.com">mail</a>',
    )
  })

  it('renders a relative link without target', () => {
    expect(html('[now](/now)')).toBe('<a href="/now">now</a>')
  })

  it('rejects unsafe href schemes and emits plain text', () => {
    expect(html('[x](javascript:alert(1))')).toBe('[x](javascript:alert(1))')
  })

  it('handles multiple/adjacent tokens in one string', () => {
    expect(html('**a***b*')).toBe('<strong>a</strong><em>b</em>')
  })

  it('exposes parseInline returning an array of nodes', () => {
    expect(Array.isArray(parseInline('hi'))).toBe(true)
  })
})
