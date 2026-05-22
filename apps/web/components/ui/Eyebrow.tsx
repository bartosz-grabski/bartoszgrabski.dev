interface EyebrowProps {
  children: React.ReactNode
  as?: 'h2' | 'h3' | 'h4' | 'p'
}

export function Eyebrow({ children, as: Tag = 'h3' }: EyebrowProps) {
  return <Tag className="eyebrow">{children}</Tag>
}
