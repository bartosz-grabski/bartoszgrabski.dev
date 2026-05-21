import { useLang } from '@/lib/i18n'

interface FooterProps {
  name: string
}

export function Footer({ name }: FooterProps) {
  const { T } = useLang()
  return (
    <footer className="footer">
      <span>{T.footer.copy(new Date().getFullYear(), name)}</span>
      <span>{T.footer.built}</span>
    </footer>
  )
}
