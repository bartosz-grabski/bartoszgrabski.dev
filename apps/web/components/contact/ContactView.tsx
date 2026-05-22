import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ContactForm } from './ContactForm'
import type { Resume } from '@/lib/types'

const LINKS = {
  email: 'mailto:hello@bartoszgrabski.dev',
  github: 'https://github.com/bgrabski',
  linkedin: 'https://www.linkedin.com/in/bartosz-grabski-b89a0738/',
  calendar: 'https://cal.com/bgrabski/intro',
} as const

interface ContactViewProps {
  resume: Resume
  showToast: (msg: string) => void
}

export function ContactView({ resume, showToast }: ContactViewProps) {
  const { T } = useLang()
  const [pre, em, post] = T.contactHead
  const firstName = resume.basics.name.split(' ')[0]

  const rows = [
    { label: T.channels.email,    handle: resume.basics.email,          href: LINKS.email },
    { label: T.channels.github,   handle: 'github.com/bgrabski',        href: LINKS.github },
    { label: T.channels.linkedin, handle: 'in/bartosz-grabski',         href: LINKS.linkedin },
    { label: T.channels.calendar, handle: 'cal.com/bgrabski',           href: LINKS.calendar },
  ]

  return (
    <div className="contact" data-view="contact">
      <div className="statement">
        <h2>
          {pre}{pre && em ? ' ' : ''}
          {em && <em>{em}</em>}
          {post}
        </h2>
        <p>{T.contactSub1(T.available)}</p>
        <p>{T.contactSub2}</p>
        <p className="signed">{T.contactSign(firstName)}</p>
      </div>

      <div>
        <Eyebrow>{T.sections.channels}</Eyebrow>
        <div className="contact-list">
          {rows.map(r => (
            <a
              key={r.label}
              href={r.href}
              className="contact-row"
              target={r.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
            >
              <span className="label">{r.label}</span>
              <span className="handle">{r.handle}</span>
              <span className="arrow" aria-hidden="true" />
            </a>
          ))}
        </div>

        <section className="form-section">
          <Eyebrow as="h3">{T.sections.note}</Eyebrow>
          <ContactForm showToast={showToast} toastMessage={T.toasts.queued} />
        </section>
      </div>
    </div>
  )
}
