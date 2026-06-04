import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ContactForm } from './ContactForm'
import type { Resume, Bilingual, Channel } from '@/lib/types'

const LINKS = {
  email:    'mailto:hello@bartoszgrabski.dev',
  calendar: 'https://cal.com/bgrabski/intro',
} as const

interface ContactViewProps {
  resume: Resume
  showToast: (msg: string) => void
  availabilityLabel: Bilingual
  calendarUrl?: string
  channels?: Channel[]
}

export function ContactView({ resume, showToast, availabilityLabel, calendarUrl, channels }: ContactViewProps) {
  const { T, t } = useLang()
  const [pre, em, post] = T.contactHead
  const firstName = resume.basics.name.split(' ')[0]
  const calHref = calendarUrl ?? LINKS.calendar

  const channelRows = (channels ?? []).map(c => {
    const parsed = new URL(c.url)
    const handle = parsed.hostname.replace(/^www\./, '') + parsed.pathname
    return { label: T.channels[c.type], handle, href: c.url }
  })

  const rows = [
    { label: T.channels.email,    handle: resume.basics.email,          href: LINKS.email },
    ...channelRows,
    { label: T.channels.calendar, handle: new URL(calHref).hostname + new URL(calHref).pathname, href: calHref },
  ]

  return (
    <div className="contact" data-view="contact">
      <div className="statement">
        <h2>
          {pre}{pre && em ? ' ' : ''}
          {em && <em>{em}</em>}
          {post}
        </h2>
        <p>{T.contactSub1(t(availabilityLabel))}</p>
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
