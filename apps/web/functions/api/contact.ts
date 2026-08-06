import { validateContactPayload } from '../../worker/validateContactPayload'

// Cloudflare Pages Function for POST /api/contact — deployed alongside the
// existing Pages project (file-based routing: this path handles /api/contact,
// and only POST because only `onRequestPost` is exported; other methods get
// Cloudflare's default 405).
//
// Bindings (`EMAIL`, `TURNSTILE_SECRET`) come from the Pages project's
// dashboard configuration (Settings → Functions → Bindings) in production —
// they are NOT read from this repo's wrangler.jsonc for a Git-connected
// Pages deploy. Locally, `wrangler pages dev` reads them from `.dev.vars`.

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const CONTACT_TO = 'hello@bartoszgrabski.dev'
const CONTACT_FROM = {
  email: 'hello@bartoszgrabski.dev',
  name: 'bartoszgrabski.dev — formularz kontaktowy',
}

interface IncomingBody {
  website?: unknown
  turnstileToken?: unknown
  [key: string]: unknown
}

interface PagesContext {
  request: Request
  env: Env
}

async function verifyTurnstile(token: unknown, secret: string, ip: string | null): Promise<boolean> {
  if (typeof token !== 'string' || token.length === 0) return false

  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch (err) {
    console.error('contact form: turnstile verification failed', err)
    return false
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context

  let body: IncomingBody
  try {
    body = (await request.json()) as IncomingBody
  } catch {
    return json({ ok: false, error: 'invalid_payload' }, 400)
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return json({ ok: false, error: 'invalid_payload' }, 400)
  }

  // Honeypot: real visitors never fill this hidden field. A bot that
  // autofills every input gets a fake success with no side effects.
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return json({ ok: true })
  }

  const validation = validateContactPayload(body)
  if (!validation.ok) {
    return json({ ok: false, error: validation.error }, 400)
  }

  const verified = await verifyTurnstile(
    body.turnstileToken,
    env.TURNSTILE_SECRET,
    request.headers.get('CF-Connecting-IP'),
  )
  if (!verified) {
    return json({ ok: false, error: 'turnstile_failed' }, 400)
  }

  const { name, email, phone, message } = validation.data
  const lines = [
    `Imię / Name: ${name}`,
    `Email: ${email}`,
    `Telefon / Phone: ${phone ?? '—'}`,
    '',
    message,
  ]

  try {
    await env.EMAIL.send({
      to: CONTACT_TO,
      from: CONTACT_FROM,
      replyTo: email,
      subject: `Wiadomość ze strony — ${name}`,
      text: lines.join('\n'),
      html: lines.map((line) => `<p>${escapeHtml(line).replace(/\n/g, '<br>')}</p>`).join(''),
    })
  } catch (err) {
    console.error('contact form: email send failed', err)
    return json({ ok: false, error: 'send_failed' }, 500)
  }

  return json({ ok: true })
}
