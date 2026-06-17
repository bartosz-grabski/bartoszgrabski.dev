'use client'
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { RichText } from '@/components/ui/RichText'
import type { Resume, Bilingual, Channel, Contact } from '@/lib/types'

const LINKS = {
  email:    'mailto:hello@bartoszgrabski.dev',
  calendar: 'https://cal.com/bgrabski/intro',
} as const

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
  // Each field is checked individually — a contact document may exist with
  // only some fields populated.
  const headingText = contact?.heading ? t(contact.heading) : null
  const availabilityText = contact?.availabilityLine
    ? t(contact.availabilityLine).replace('{availability}', period)
    : T.contactSub1(t(availabilityLabel))
  const bookingText = contact?.bookingLine ? t(contact.bookingLine) : T.contactSub2
  const signText = contact?.signature
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
        <h1>
          {headingText !== null ? (
            <RichText text={headingText} />
          ) : (
            <>
              {T.contactHead[0]}
              {T.contactHead[0] && T.contactHead[1] ? ' ' : ''}
              {T.contactHead[1] && <em>{T.contactHead[1]}</em>}
              {T.contactHead[2]}
            </>
          )}
        </h1>
        <p><RichText text={availabilityText} /></p>
        <p><RichText text={bookingText} /></p>
        <p className="signed"><RichText text={signText} /></p>
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
