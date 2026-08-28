'use client'
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Services } from '@/lib/types'

const FALLBACK_CALENDAR = 'https://cal.com/bgrabski/intro'

interface ServicesViewProps {
  services: Services | null
  email: string
  phone?: string
  calendarUrl?: string
}

export function ServicesView({ services, email, phone, calendarUrl }: ServicesViewProps) {
  const { t } = useLang()

  // All copy is Sanity-managed (like the CV and Now pages); until the services
  // document exists there is nothing to render.
  if (!services) return null

  const calHref = calendarUrl ?? FALLBACK_CALENDAR

  return (
    <div className="services" data-view="services">
      <header className="services-head">
        {/* The masthead name is the page <h1> on the index, so the page title is an h2. */}
        <h2 className="services-title">{t(services.title)}</h2>
        <p className="services-lede">{t(services.lede)}</p>
      </header>

      {services.blocks.map((block) => (
        <section className="svc" key={block.cmd}>
          <div className="svc-bar">
            <h3 className="svc-cmd">{block.cmd}</h3>
            {block.tag && <span className="svc-tag">{t(block.tag)}</span>}
          </div>
          <div className="svc-body">
            {block.blurb && <p>{t(block.blurb)}</p>}
            <ul className="svc-list">
              {block.bullets.map((bullet, i) => (
                <li key={i}>{t(bullet.text)}</li>
              ))}
            </ul>
            {block.stack.length > 0 && (
              <div className="svc-stack">
                {block.stack.map((chip, i) => (
                  <span className="chip" key={i}>{t(chip)}</span>
                ))}
              </div>
            )}
            {block.note && <p className="svc-note">{t(block.note)}</p>}
          </div>
        </section>
      ))}

      {services.steps.length > 0 && (
        <section className="svc-how">
          <Eyebrow>{t(services.howHeading)}</Eyebrow>
          <div className="steps">
            {services.steps.map((step, i) => (
              <div className="step" key={i}>
                <div className="step-n">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="step-t">{t(step.title)}</h3>
                <p>{t(step.text)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {services.cta && (
        <section className="svc-cta">
          <p className="cta-line">{t(services.cta.line)}</p>
          <p className="cta-blurb">{t(services.cta.blurb)}</p>
          <div className="cta-links">
            <a className="btn primary" href={calHref} target="_blank" rel="noopener noreferrer">
              {t(services.cta.book)}
            </a>
            <a className="btn" href={`mailto:${email}`}>{email}</a>
            {phone && <a className="btn" href={`tel:${phone.replace(/[\s-]/g, '')}`}>{phone}</a>}
          </div>
        </section>
      )}
    </div>
  )
}
