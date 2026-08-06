'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Script from 'next/script'
import { useLang } from '@/lib/i18n'
import { useToast } from '@/lib/toast'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
      ) => string
      reset: (widgetId?: string) => void
    }
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldName = 'name' | 'email' | 'message'
type FieldErrors = Partial<Record<FieldName, string>>
type SubmitState = 'idle' | 'sending'

export function ContactForm() {
  const { T } = useLang()
  const showToast = useToast()
  const widgetContainerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const turnstileTokenRef = useRef('')
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [state, setState] = useState<SubmitState>('idle')

  useEffect(() => {
    if (scriptLoaded && window.turnstile && widgetContainerRef.current && widgetIdRef.current === null) {
      widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => {
          turnstileTokenRef.current = token
        },
      })
    }
  }, [scriptLoaded])

  function validate(fd: FormData): FieldErrors {
    const errors: FieldErrors = {}
    if (!String(fd.get('name') ?? '').trim()) errors.name = T.contactForm.errors.name

    const email = String(fd.get('email') ?? '').trim()
    if (!email) errors.email = T.contactForm.errors.emailRequired
    else if (!EMAIL_RE.test(email)) errors.email = T.contactForm.errors.emailInvalid

    if (!String(fd.get('message') ?? '').trim()) errors.message = T.contactForm.errors.message

    return errors
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fd = new FormData(form)

    const errors = validate(fd)
    setFieldErrors(errors)
    setServerError(null)
    if (Object.keys(errors).length > 0) return

    setState('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          phone: fd.get('phone') || undefined,
          message: fd.get('message'),
          turnstileToken: turnstileTokenRef.current,
          website: fd.get('website'),
        }),
      })
      const data: { ok: boolean; error?: keyof typeof T.contactForm.errors } = await res.json()

      if (!res.ok || !data.ok) {
        setServerError(T.contactForm.errors[data.error ?? 'send_failed'])
        turnstileTokenRef.current = ''
        if (window.turnstile && widgetIdRef.current !== null) {
          window.turnstile.reset(widgetIdRef.current)
        }
        setState('idle')
        return
      }

      showToast(T.toasts.contactSent)
      form.reset()
      turnstileTokenRef.current = ''
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current)
      }
      setState('idle')
    } catch {
      setServerError(T.contactForm.errors.send_failed)
      turnstileTokenRef.current = ''
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current)
      }
      setState('idle')
    }
  }

  return (
    <div className="form-section">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer onLoad={() => setScriptLoaded(true)} />
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="contact-name">{T.contactForm.name}</label>
          <input id="contact-name" name="name" type="text" autoComplete="name" />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor="contact-email">{T.contactForm.email}</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="contact-phone">{T.contactForm.phone}</label>
          <input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
        </div>

        <div className="field">
          <label htmlFor="contact-message">{T.contactForm.message}</label>
          <textarea id="contact-message" name="message" rows={5} />
          {fieldErrors.message && <p className="field-error">{fieldErrors.message}</p>}
        </div>

        {/* Honeypot: hidden from sighted users and assistive tech, and out of
            tab order. Real visitors never fill it; bots that autofill every
            input do, and the Worker silently no-ops on a non-empty value. */}
        <div className="visually-hidden" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div ref={widgetContainerRef} className="cf-turnstile" />

        {serverError && <p className="field-error">{serverError}</p>}

        <button type="submit" className="btn primary" disabled={state === 'sending'}>
          {state === 'sending' ? T.contactForm.sending : T.contactForm.submit}
        </button>

        <p className="form-note">{T.contactForm.rodo}</p>
      </form>
    </div>
  )
}
