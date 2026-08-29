'use client'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Services, ServiceCtaLink } from '@/lib/types'

interface ServicesViewProps {
  services: Services | null
}

function CtaButton({ link, label, lang }: { link: ServiceCtaLink; label: string; lang: string }) {
  const className = link.style === 'light' ? 'btn primary' : 'btn'
  // Internal paths ('/contact') are locale-prefixed and soft-navigated;
  // everything else (https/mailto/tel) is a plain anchor.
  if (link.url.startsWith('/')) {
    return (
      <Link className={className} href={`/${lang}${link.url === '/' ? '' : link.url}`}>
        {label}
      </Link>
    )
  }
  const external = link.url.startsWith('http')
  return (
    <a
      className={className}
      href={link.url}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {label}
    </a>
  )
}

export function ServicesView({ services }: ServicesViewProps) {
  const { t, lang } = useLang()

  // All copy is Sanity-managed (like the CV and Now pages); until the services
  // document exists there is nothing to render.
  if (!services) return null

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
          {services.cta.links.length > 0 && (
            <div className="cta-links">
              {services.cta.links.map((link, i) => (
                <CtaButton key={i} link={link} label={t(link.label)} lang={lang} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
