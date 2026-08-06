import { validateContactPayload } from './validateContactPayload'

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

async function verifyTurnstile(token: unknown, secret: string, ip: string | null): Promise<boolean> {
  if (typeof token !== 'string' || token.length === 0) return false

  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)

  const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form })
  const data = (await res.json()) as { success: boolean }
  return data.success === true
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method !== 'POST' || url.pathname !== '/api/contact') {
      return new Response('Not found', { status: 404 })
    }

    let body: IncomingBody
    try {
      body = (await request.json()) as IncomingBody
    } catch {
      return json({ ok: false, error: 'invalid_payload' }, 400)
    }

    // Honeypot: real visitors never see or fill this field. A bot that fills
    // every input gets a fake success with no email sent and no Turnstile
    // check spent on it.
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
        html: lines.map((line) => `<p>${line}</p>`).join(''),
      })
    } catch (err) {
      console.error('contact form: email send failed', err)
      return json({ ok: false, error: 'send_failed' }, 500)
    }

    return json({ ok: true })
  },
}
