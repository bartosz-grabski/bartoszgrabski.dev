import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Resume, Bilingual, Channel, Contact } from '@/lib/types'

const LINKS = {
  email:    'mailto:hello@bartoszgrabski.dev',
  calendar: 'https://cal.com/bgrabski/intro',
} as const

/** Splits a heading like "Let's *talk*." into [pre, emphasised, post]. */
function parseHeading(heading: string): [string, string, string] {
  const match = heading.match(/^(.*?)\*([^*]+)\*(.*)$/)
  if (!match) return [heading, '', '']
  return [match[1], match[2], match[3]]
}

interface ContactViewProps {
  resume: Resume
  availabilityLabel: Bilingual
  calendarUrl?: string
  channels?: Channel[]
  contact?: Contact
}

export function ContactView({ resume, availabilityLabel, calendarUrl, channels, contact }: ContactViewProps) {
  const { T, t } = useLang()
  const firstName = resume.basics.name.split(' ')[0]
  const period = t(availabilityLabel).toLowerCase()

  // Prefer Sanity-managed copy; fall back to the hardcoded translations.
  const [pre, em, post] = contact
    ? parseHeading(t(contact.heading))
    : T.contactHead
  const availabilityText = contact
    ? t(contact.availabilityLine).replace('{availability}', period)
    : T.contactSub1(t(availabilityLabel))
  const bookingText = contact ? t(contact.bookingLine) : T.contactSub2
  const signText = contact
    ? t(contact.signature).replace('{name}', firstName)
    : T.contactSign(firstName)

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
        <p>{availabilityText}</p>
        <p>{bookingText}</p>
        <p className="signed">{signText}</p>
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

      </div>
    </div>
  )
}
