import { Fragment, type ReactNode } from 'react'

// Inline-markdown subset. Order matters: ** before *, link before everything.
// Tokens are matched non-greedily within a single string. Link labels are NOT
// recursively parsed (kept as plain text by design).
const TOKEN = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g

const SAFE_HREF = /^(https?:|mailto:|\/|#)/i
const EXTERNAL = /^https?:/i

export function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  for (const m of text.matchAll(TOKEN)) {
    const index = m.index ?? 0
    if (index > last) nodes.push(text.slice(last, index))

    if (m[1] !== undefined) {
      const label = m[2]
      const href = m[3]
      if (SAFE_HREF.test(href)) {
        const ext = EXTERNAL.test(href)
        nodes.push(
          <a
            key={key++}
            href={href}
            {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {label}
          </a>,
        )
      } else {
        nodes.push(m[0])
      }
    } else if (m[4] !== undefined) {
      nodes.push(<strong key={key++}>{m[5]}</strong>)
    } else if (m[6] !== undefined) {
      nodes.push(<em key={key++}>{m[7]}</em>)
    } else if (m[8] !== undefined) {
      nodes.push(<code key={key++}>{m[9]}</code>)
    }

    last = index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function RichText({ text }: { text: string }) {
  return <Fragment>{parseInline(text)}</Fragment>
}
