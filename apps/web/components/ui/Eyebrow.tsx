interface EyebrowProps {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p'
}

// Section labels sit under the masthead <h1> (the name), so they default to h2.
export function Eyebrow({ children, as: Tag = 'h2' }: EyebrowProps) {
  return <Tag className="eyebrow">{children}</Tag>
}
